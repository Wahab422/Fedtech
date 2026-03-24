/**
 * FinsweetService: A singleton wrapper around the Finsweet Attributes library.
 *
 * Responsibilities:
 * 1. Safely await any Finsweet attribute (`waitForAttribute`).
 * 2. Provide a single source of truth for the `list` attribute instances (`whenListReady`, `getListInstances`).
 * 3. Register lifecycle hooks for `filter`, `beforeRender`, `render`, `afterRender` phases.
 * 4. Offer utilities such as `clearFilters()` for quick insight into the active filters.
 *
 * TODO:
 * - Add more utitlities for safe list manipulation
 * - Better type safety
 * - Add support for other finsweet solutions (load, rangeslider, etc)
 *
 * This class purposefully avoids any framework-specific code and keeps its public API minimal yet
 * extensible for future requirements.
 */

import { logger } from '../utils/logger';

function ensureFinsweetGlobal() {
  if (typeof window === 'undefined') {
    throw new Error('FinsweetService can only run in a browser environment.');
  }
  window.FinsweetAttributes ||= [];
  return window.FinsweetAttributes;
}

export class FinsweetService {
  constructor() {
    // Map<attributeKey, Promise<unknown>>
    this.attributePromises = new Map();

    // Holds `list` API once ready
    this.listInstances = undefined;

    // Track disposers for watchers/effects/hooks created through the service.
    this.disposers = [];

    // Pre-warm the list promise so every import gets the same reference
    this.listReadyPromise = this.waitForAttribute('list').then((api) => {
      this.listInstances = api;
      return api;
    });
  }

  waitForAttribute(key) {
    if (this.attributePromises.has(key)) {
      return this.attributePromises.get(key);
    }

    // If already loaded (script executed before us) resolve synchronously
    const maybeLoaded = this.resolveImmediatelyIfLoaded(key);
    if (maybeLoaded) {
      const p = maybeLoaded;
      this.attributePromises.set(key, p);
      return p;
    }

    // Otherwise queue callback until attribute initialises
    const promise = new Promise((resolve) => {
      const global = ensureFinsweetGlobal();
      global.push([
        key,
        (api) => {
          resolve(api);
        },
      ]);
    });

    this.attributePromises.set(key, promise);
    return promise;
  }

  async restartAttribute(key) {
    const global = ensureFinsweetGlobal();
    if (global && typeof global === 'object' && 'modules' in global) {
      const controls = global.modules?.[key];
      if (controls) {
        if (typeof controls.restart === 'function') {
          controls.restart();
        }
        const maybePromise = controls.loading;
        return maybePromise && typeof maybePromise.then === 'function'
          ? maybePromise
          : Promise.resolve(maybePromise);
      }
    }
    // Fallback: just wait for first load
    return this.waitForAttribute(key);
  }

  whenListReady() {
    return this.listReadyPromise;
  }

  getListInstances() {
    return this.listInstances;
  }

  getListArray() {
    const listsApi = this.listInstances;

    if (Array.isArray(listsApi)) return listsApi;
    if (listsApi && typeof listsApi === 'object') return Object.values(listsApi);
    return [];
  }

  registerHook(phase, callback) {
    this.registerHookInternal(phase, (list, items) => {
      callback(list, items);
      return items;
    });
  }

  /**
   * Register a hook that can return modified items (for filter, sort, beforeRender phases).
   * Callback return value is passed to the next lifecycle phase.
   */
  registerHookMutable(phase, callback) {
    this.registerHookInternal(phase, (list, items) => {
      const result = callback(list, items);
      return result !== undefined ? result : items;
    });
  }

  registerHookInternal(phase, callback) {
    this.whenListReady().then((listsApi) => {
      const instances = Array.isArray(listsApi)
        ? listsApi
        : listsApi && typeof listsApi === 'object'
          ? Object.values(listsApi)
          : [];

      instances.forEach((list) => {
        if (list && typeof list.addHook === 'function') {
          list.addHook(phase, (items) => callback(list, items));
        }
      });
    });
  }

  onStart(cb) {
    this.registerHook('start', cb);
  }

  onFilter(cb) {
    this.registerHook('filter', cb);
  }

  onSort(cb) {
    this.registerHookMutable('sort', cb);
  }

  onPagination(cb) {
    this.registerHook('pagination', cb);
  }

  onBeforeRender(cb) {
    this.registerHookMutable('beforeRender', cb);
  }

  onRender(cb) {
    this.registerHook('render', cb);
  }

  onAfterRender(cb) {
    this.registerHook('afterRender', cb);
  }

  onListChange(source, callback, options) {
    const disposeTasks = [];

    this.getListArray().forEach((list) => {
      if (list && typeof list.watch === 'function') {
        const stop = list.watch(source(list), callback(list), options);
        if (typeof stop === 'function') {
          disposeTasks.push(stop);
        }
      }
    });

    const cleanup = () => {
      disposeTasks.forEach((dispose) => {
        try {
          dispose();
        } catch (error) {
          logger.warn('[FinsweetService] Failed to dispose watcher', error);
        }
      });
    };

    this.disposers.push(cleanup);
    return cleanup;
  }

  addEffect(effectCallback, options) {
    const disposeTasks = [];

    this.getListArray().forEach((list) => {
      if (list && typeof list.effect === 'function') {
        const stop = list.effect(effectCallback(list), options);
        if (typeof stop === 'function') {
          disposeTasks.push(stop);
        }
      }
    });

    const cleanup = () => {
      disposeTasks.forEach((dispose) => {
        try {
          dispose();
        } catch (error) {
          logger.warn('[FinsweetService] Failed to dispose effect', error);
        }
      });
    };

    this.disposers.push(cleanup);
    return cleanup;
  }

  /**
   * Get the list instance by attribute
   * @param attribute - The attribute to get the list instance for (e.g. 'data-products-list')
   * @returns The finsweet list instance
   */
  async getListByAttribute(attribute) {
    const listsApi = await this.whenListReady();

    // Normalise to an array irrespective of the structure we receive.
    const listArray = Array.isArray(listsApi)
      ? listsApi
      : listsApi && typeof listsApi === 'object'
        ? Object.values(listsApi)
        : [];

    const targetList = listArray.find((list) =>
      list?.listElement?.attributes.getNamedItem(attribute)
    );

    if (!targetList) return undefined;

    // -------------------------------------------------------------------
    // Ensure the instance has finished all asynchronous loading tasks.
    // -------------------------------------------------------------------
    // length before loaders
    const loaders = [];

    if (targetList.loadingSearchParamsData) loaders.push(targetList.loadingSearchParamsData);
    if (targetList.loadingPaginationElements) loaders.push(targetList.loadingPaginationElements);
    if (targetList.loadingPaginatedItems) loaders.push(targetList.loadingPaginatedItems);

    // Wait for every promise (ignore undefined values) to resolve.
    if (loaders.length) {
      try {
        await Promise.all(loaders);
      } catch (err) {
        logger.warn('[FinsweetService] Target list loaders rejected', err);
      }
    }

    return targetList;
  }

  async getListByInstance(instanceKey) {
    if (!instanceKey) return undefined;
    const listsApi = await this.whenListReady();
    const listArray = Array.isArray(listsApi)
      ? listsApi
      : listsApi && typeof listsApi === 'object'
        ? Object.values(listsApi)
        : [];

    return listArray.find((list) => list?.instance === instanceKey);
  }

  /**
   * Clears all filter conditions except the specified condition for the provided
   * list instance. If the specified condition is missing, all conditions are
   * removed. This keeps the source-of-truth inside Finsweet in sync when the
   * dataset (mode) changes.
   */
  clearFiltersExceptFor(listInstance, exceptFor = []) {
    if (!listInstance) return;

    const filtersGroup = listInstance?.filters?.value?.groups?.[0];
    if (!filtersGroup) return;

    const typeCondition = filtersGroup.conditions.find((c) => exceptFor?.includes(c.fieldKey));

    if (typeCondition) {
      const plainTypeCondition = JSON.parse(JSON.stringify(typeCondition));
      filtersGroup.conditions.splice(0, filtersGroup.conditions.length, plainTypeCondition);
    } else {
      logger.warn('[FinsweetService] No condition found. Clearing all filters.');
      filtersGroup.conditions.splice(0, filtersGroup.conditions.length);
    }
  }

  /**
   * Clears filters by removing specific conditions or all conditions if none specified
   * @param listInstance – the list instance to clear filters for
   * @param specificConditionKeys – the condition keys to remove (if empty, removes all)
   */
  clearFilters(listInstance, specificConditionKeys = []) {
    if (!listInstance) return;

    const filtersGroup = listInstance?.filters?.value?.groups?.[0];
    if (!filtersGroup) return;

    if (specificConditionKeys.length === 0) {
      // Remove all conditions
      filtersGroup.conditions.splice(0, filtersGroup.conditions.length);
    } else {
      // clear without causing Uncaught (in promise) DataCloneError: Failed to execute 'postMessage' on 'Worker': #<Object> could not be cloned.
      // IMPORTANT, this is a vue ref so DataCloneERROR can happen, we can't use .filter
      for (const condition of [...filtersGroup.conditions]) {
        if (specificConditionKeys.includes(condition.fieldKey)) {
          filtersGroup.conditions.splice(filtersGroup.conditions.indexOf(condition), 1);
        }
      }
    }
  }

  dispose() {
    this.disposers.forEach((dispose) => {
      try {
        dispose();
      } catch (error) {
        logger.warn('[FinsweetService] Failed to run disposer', error);
      }
    });
    this.disposers.length = 0;
  }

  resolveImmediatelyIfLoaded(key) {
    const global = ensureFinsweetGlobal();
    if (global && typeof global === 'object' && 'modules' in global) {
      const controls = global.modules?.[key];
      if (controls) {
        const maybePromise = controls.loading;
        return maybePromise && typeof maybePromise.then === 'function'
          ? maybePromise
          : Promise.resolve(maybePromise);
      }
    }
    return undefined;
  }
}

const finsweetService = new FinsweetService();

const finsweetFeature = {
  name: 'finsweet',
  global: true,
  init() {
    // Warm up the service so it's ready for use on any page (including agenda)
    finsweetService.whenListReady().catch(() => {
      // Finsweet list may not exist on all pages; that's ok
    });
  },
};

export default finsweetFeature;
export { finsweetService };
