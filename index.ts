// Type for blood sugar range thresholds
interface BloodSugarRange {
  veryHigh: number; // Very high level, >9 mmol/L
  high: [number, number]; // High level, 6-9 mmol/L
  normal: [number, number]; // Normal level, 4-6 mmol/L
  low: number; // Low level, <4 mmol/L
}

// Type for blood sugar level counters
interface BloodSugarCounters {
  veryHigh: number; // Count of very high level cases
  high: number; // Count of high level cases
  normal: number; // Count of normal level cases
  low: number; // Count of low level cases
}

// Type for average blood sugar levels at specific times
interface BloodSugarTimeStats {
  beforeBreakfast?: number; // Average level before breakfast
  afterBreakfast?: number; // Average level after breakfast
  beforeLunch?: number; // Average level before lunch
  afterLunch?: number; // Average level after lunch
  beforeDinner?: number; // Average level before dinner
  afterDinner?: number; // Average level after dinner
  beforeSleep?: number; // Average level before sleep
  random?: number; // Average random level
}

// Type for blood sugar statistics over a period
interface BloodSugarPeriodStats {
  startDate: string; // Start date of the period (ISO format)
  endDate: string; // End date of the period (ISO format)
  average: number | null; // Average level over the period
  highest: number | null; // Highest level over the period
  lowest: number | null; // Lowest level over the period
  counters: BloodSugarCounters; // Counters for different levels
  timeStats: BloodSugarTimeStats; // Average levels at specific times
}

// Type for the entire application state, including settings
interface BloodSugarAppState {
  range: BloodSugarRange; // Range thresholds
  statsByPeriod: Record<string, BloodSugarPeriodStats>; // Data for periods (7, 14, 30, 90 days)
  currentPeriod: string; // Currently selected period ("7", "14", "30", "90")
}

// Utility function to calculate date offset
function calculateDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Example data for initialization
const initialState: BloodSugarAppState = {
  range: {
    veryHigh: 9,
    high: [6, 9],
    normal: [4, 6],
    low: 4,
  },
  statsByPeriod: {
    "7": {
      startDate: calculateDateOffset(7),
      endDate: calculateDateOffset(0),
      average: null,
      highest: null,
      lowest: null,
      counters: {
        veryHigh: 0,
        high: 0,
        normal: 0,
        low: 0,
      },
      timeStats: {},
    },
    "14": {
      startDate: calculateDateOffset(14),
      endDate: calculateDateOffset(0),
      average: null,
      highest: null,
      lowest: null,
      counters: {
        veryHigh: 0,
        high: 0,
        normal: 0,
        low: 0,
      },
      timeStats: {},
    },
    "30": {
      startDate: calculateDateOffset(30),
      endDate: calculateDateOffset(0),
      average: null,
      highest: null,
      lowest: null,
      counters: {
        veryHigh: 0,
        high: 0,
        normal: 0,
        low: 0,
      },
      timeStats: {},
    },
    "90": {
      startDate: calculateDateOffset(90),
      endDate: calculateDateOffset(0),
      average: null,
      highest: null,
      lowest: null,
      counters: {
        veryHigh: 0,
        high: 0,
        normal: 0,
        low: 0,
      },
      timeStats: {},
    },
  },
  currentPeriod: "7",
};

// Function to add a new blood sugar measurement
function addMeasurement(state: BloodSugarAppState, level: number, timeCategory?: keyof BloodSugarTimeStats): BloodSugarAppState {
  const period = state.statsByPeriod[state.currentPeriod];

  // Update counters based on the level
  if (level > state.range.veryHigh) {
    period.counters.veryHigh++;
  } else if (level >= state.range.high[0] && level <= state.range.high[1]) {
    period.counters.high++;
  } else if (level >= state.range.normal[0] && level <= state.range.normal[1]) {
    period.counters.normal++;
  } else if (level < state.range.low) {
    period.counters.low++;
  }

  // Update highest and lowest values
  if (period.highest === null || level > period.highest) {
    period.highest = level;
  }
  if (period.lowest === null || level < period.lowest) {
    period.lowest = level;
  }

  // Update average
  const totalMeasurements =
    period.counters.veryHigh + period.counters.high + period.counters.normal + period.counters.low;
  period.average = ((period.average ?? 0) * (totalMeasurements - 1) + level) / totalMeasurements;

  // Update time-specific statistics
  if (timeCategory) {
    const currentStat = period.timeStats[timeCategory] ?? 0;
    const totalForCategory = Object.values(period.timeStats).reduce(
      (total, value) => total + (value ?? 0),
      0
    );
    period.timeStats[timeCategory] = (currentStat * (totalForCategory - 1) + level) / totalMeasurements;
  }

  return { ...state, statsByPeriod: { ...state.statsByPeriod, [state.currentPeriod]: period } };
}

// Function to retrieve statistics for the current period
function getCurrentPeriodStats(state: BloodSugarAppState): BloodSugarPeriodStats {
  return state.statsByPeriod[state.currentPeriod];
}

// Function to switch to a different period
function switchPeriod(state: BloodSugarAppState, period: string): BloodSugarAppState {
  if (!state.statsByPeriod[period]) {
    throw new Error("Invalid period");
  }
  return { ...state, currentPeriod: period };
}

// Test function to simulate adding and fetching stats from a database-like object
function simulateApp(databaseObject: BloodSugarAppState) {
  let state = { ...databaseObject };

  // Simulating adding blood sugar measurements
  state = addMeasurement(state, 5.5, "beforeBreakfast");
  state = addMeasurement(state, 7.8, "afterLunch");
  state = addMeasurement(state, 9.3, "random");
  state = addMeasurement(state, 3.9, "beforeSleep");

  // Log the stats for the current period
  console.log("Stats for the current period:", getCurrentPeriodStats(state));

  // Simulate switching periods and fetching stats
  try {
    state = switchPeriod(state, "14");
    console.log("Switched period stats:", getCurrentPeriodStats(state));
  } catch (err) {
    console.error("Error switching period:", err);
  }

  return state;
}

// Run the simulation
simulateApp(initialState);
