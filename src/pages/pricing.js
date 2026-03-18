import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initAccordion } from '../components/accordion';
const cleanupFunctions = [];

export async function initPricingPage() {
  logger.log('💰 Pricing page initialized');

  try {
    initPricingTable();
    initPricingModule();
    initAccordion();
  } catch (error) {
    handleError(error, 'Pricing Page Initialization');
  }
}

export function cleanupPricingPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Pricing Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}

function initPricingModule() {
  (() => {
    const ranges = document.querySelectorAll('input[type="range"]');

    function setPct(r) {
      const min = Number(r.min || 0);
      const max = Number(r.max || 100);
      const val = Number(r.value || 0);
      const pct = ((val - min) * 100) / (max - min);
      r.style.setProperty('--pct', pct + '%');
    }

    ranges.forEach((r) => {
      setPct(r);
      r.addEventListener('input', () => setPct(r));
      r.addEventListener('change', () => setPct(r));
    });
  })();

  const PRICING = {
    basePlan: 49,
    freeEvents: 1_000_000,
    freeReads: 1_000_000,
    freeWrites: 1_000_000,
    freeStorageGB: 1,
    eventsPerThousand: 0.05,
    readsPerThousand: 0.02,
    writesPerThousand: 0.1,
    storagePerGB: 5,
  };

  function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(0) + 'k';
    return String(num);
  }

  function formatCurrency(num) {
    if (num >= 1000) {
      return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return '$' + num.toFixed(2);
  }

  function sliderToOperations(value) {
    if (value === 0) return 0;
    const minLog = Math.log10(1000); // 1k
    const maxLog = Math.log10(1_000_000_000); // 1B
    const scale = minLog + (value / 100) * (maxLog - minLog);
    return Math.round(Math.pow(10, scale));
  }

  function sliderToStorage(value) {
    if (value === 0) return 0;
    const minLog = Math.log10(0.1); // 0.1 GB
    const maxLog = Math.log10(500); // 500 GB
    const scale = minLog + (value / 100) * (maxLog - minLog);
    return Math.round(Math.pow(10, scale) * 10) / 10;
  }

  function calculateCost(events, reads, writes, storageGB) {
    const totalOperations = events + reads + writes;

    const billableEvents = Math.max(0, events - PRICING.freeEvents);
    const billableReads = Math.max(0, reads - PRICING.freeReads);
    const billableWrites = Math.max(0, writes - PRICING.freeWrites);

    const billableOperations = billableEvents + billableReads + billableWrites;
    const billableStorageGB = Math.max(0, storageGB - PRICING.freeStorageGB);

    const eventsCost = (billableEvents / 1000) * PRICING.eventsPerThousand;
    const readsCost = (billableReads / 1000) * PRICING.readsPerThousand;
    const writesCost = (billableWrites / 1000) * PRICING.writesPerThousand;

    const storageCost = billableStorageGB * PRICING.storagePerGB;
    const operationsCost = eventsCost + readsCost + writesCost;

    const hasUsageBeyondFree = billableOperations > 0 || billableStorageGB > 0;
    const basePlanCost = hasUsageBeyondFree ? PRICING.basePlan : 0;

    const totalCost = basePlanCost + operationsCost + storageCost;

    return {
      events,
      reads,
      writes,
      storageGB,
      totalOperations,
      billableOperations,
      billableStorageGB,
      billableEvents,
      billableReads,
      billableWrites,
      eventsCost,
      readsCost,
      writesCost,
      storageCost,
      operationsCost,
      basePlanCost,
      totalCost,
    };
  }

  const els = {
    sliders: {
      events: document.getElementById('eventsSlider'),
      reads: document.getElementById('readsSlider'),
      writes: document.getElementById('writesSlider'),
      storage: document.getElementById('storageSlider'),
    },

    eventsValue: document.getElementById('eventsValue'),
    readsValue: document.getElementById('readsValue'),
    writesValue: document.getElementById('writesValue'),
    storageValue: document.getElementById('storageValue'),

    totalCostText: document.getElementById('totalCostText'),
    totalOpsText: document.getElementById('totalOpsText'),
    billableOpsText: document.getElementById('billableOpsText'),
    costPerKRow: document.getElementById('costPerKRow'),
    costPerKText: document.getElementById('costPerKText'),
    freeNote: document.getElementById('freeNote'),

    eventsBreak: document.getElementById('eventsBreak'),
    readsBreak: document.getElementById('readsBreak'),
    writesBreak: document.getElementById('writesBreak'),
    storageBreak: document.getElementById('storageBreak'),

    basePlanRow: document.getElementById('basePlanRow'),
    basePlanCost: document.getElementById('basePlanCost'),
    eventsCost: document.getElementById('eventsCost'),
    readsCost: document.getElementById('readsCost'),
    writesCost: document.getElementById('writesCost'),
    storageCost: document.getElementById('storageCost'),
    totalBreak: document.getElementById('totalBreak'),
  };

  function assertEl(el, name) {
    if (!el) {
      // eslint-disable-next-line no-console
      console.warn(`[PricingModule] Missing element: ${name}`);
    }
    return el;
  }

  assertEl(els.sliders.events, 'eventsSlider');
  assertEl(els.sliders.reads, 'readsSlider');
  assertEl(els.sliders.writes, 'writesSlider');
  assertEl(els.sliders.storage, 'storageSlider');

  function readState() {
    const eS = Number(els.sliders.events?.value || 0);
    const rS = Number(els.sliders.reads?.value || 0);
    const wS = Number(els.sliders.writes?.value || 0);
    const sS = Number(els.sliders.storage?.value || 0);

    const events = sliderToOperations(eS);
    const reads = sliderToOperations(rS);
    const writes = sliderToOperations(wS);
    const storageGB = sliderToStorage(sS);

    return { events, reads, writes, storageGB };
  }

  function render() {
    const { events, reads, writes, storageGB } = readState();
    const result = calculateCost(events, reads, writes, storageGB);

    if (els.eventsValue) els.eventsValue.textContent = formatNumber(events);
    if (els.readsValue) els.readsValue.textContent = formatNumber(reads);
    if (els.writesValue) els.writesValue.textContent = formatNumber(writes);
    if (els.storageValue) els.storageValue.textContent = storageGB.toFixed(1);

    if (els.totalOpsText) els.totalOpsText.textContent = formatNumber(result.totalOperations);
    if (els.billableOpsText)
      els.billableOpsText.textContent = formatNumber(result.billableOperations);

    if (els.totalCostText) {
      if (result.totalCost === 0) {
        els.totalCostText.textContent = 'Free';
        if (els.freeNote) els.freeNote.style.display = 'block';
      } else {
        els.totalCostText.textContent = formatCurrency(result.totalCost);
        if (els.freeNote) els.freeNote.style.display = 'none';
      }
    }

    const showCostPerK = result.totalOperations > 0 && result.totalCost > 0;
    if (els.costPerKRow) els.costPerKRow.style.display = showCostPerK ? 'flex' : 'none';
    if (showCostPerK && els.costPerKText) {
      const costPerK = (result.totalCost / result.totalOperations) * 1000;
      els.costPerKText.textContent = '$' + costPerK.toFixed(4);
    }

    if (els.eventsBreak) els.eventsBreak.textContent = formatNumber(result.events);
    if (els.readsBreak) els.readsBreak.textContent = formatNumber(result.reads);
    if (els.writesBreak) els.writesBreak.textContent = formatNumber(result.writes);
    if (els.storageBreak) els.storageBreak.textContent = result.storageGB.toFixed(1) + ' GB';

    if (els.basePlanRow) els.basePlanRow.style.display = result.basePlanCost > 0 ? 'flex' : 'none';
    if (els.basePlanCost) els.basePlanCost.textContent = '$' + result.basePlanCost;

    if (els.eventsCost) els.eventsCost.textContent = formatCurrency(result.eventsCost);
    if (els.readsCost) els.readsCost.textContent = formatCurrency(result.readsCost);
    if (els.writesCost) els.writesCost.textContent = formatCurrency(result.writesCost);
    if (els.storageCost) els.storageCost.textContent = formatCurrency(result.storageCost);

    if (els.totalBreak) els.totalBreak.textContent = formatCurrency(result.totalCost) + '/mo';
  }

  Object.values(els.sliders).forEach((sl) => {
    if (!sl) return;
    sl.addEventListener('input', render);
    sl.addEventListener('change', render);
  });

  render();
}

function initPricingTable() {
  const section = document.querySelector('#pricing-section');
  if (!section) return;

  const btnMonthly = section.querySelector('[table-btn="monthly"]');
  const btnAnnually = section.querySelector('[table-btn="annually"]');

  const monthlyPrices = Array.from(section.querySelectorAll('[price-text="monthly"]'));
  const annuallyPrices = Array.from(section.querySelectorAll('[price-text="annually"]'));

  function setPlan(plan) {
    // toggle button active
    [btnMonthly, btnAnnually].forEach((b) => b && b.classList.remove('active'));
    const activeBtn = plan === 'monthly' ? btnMonthly : btnAnnually;
    if (activeBtn) activeBtn.classList.add('active');

    // toggle price active (ACTIVE ONLY)
    const monthlyActive = plan === 'monthly';
    monthlyPrices.forEach((el) => el.classList.toggle('active', monthlyActive));
    annuallyPrices.forEach((el) => el.classList.toggle('active', !monthlyActive));
  }

  // click events
  btnMonthly?.addEventListener('click', () => setPlan('monthly'));
  btnAnnually?.addEventListener('click', () => setPlan('annually'));

  // init based on which button is active already (fallback monthly)
  const initialPlan = btnAnnually?.classList.contains('active') ? 'annually' : 'monthly';
  setPlan(initialPlan);
}
