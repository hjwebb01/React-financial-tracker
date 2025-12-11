// TypeScript implementations of financial calculation functions
// Replaces the WebAssembly implementations with equivalent pure TypeScript code

const INT32_MAX = 2147483647;
const INT32_MIN = -2147483648;

/**
 * Clamp a number to int32 range (matching C behavior)
 */
function clampToInt32(value: number): number {
  if (value > INT32_MAX) {
    return INT32_MAX;
  }
  if (value < INT32_MIN) {
    return INT32_MIN;
  }
  return value;
}

/**
 * Sum an array of 32-bit integers.
 * Returns 0 if length <= 0 or array is empty.
 * Clamps result to int32 range to match C behavior.
 */
export async function sumInt32(values: Int32Array): Promise<number> {
  if (!values || values.length <= 0) {
    return Promise.resolve(0);
  }

  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += values[i];
  }

  return Promise.resolve(clampToInt32(total));
}

/**
 * Sum amounts (in cents) filtered by transaction type.
 * typeFlags: 0 for expense, 1 for income
 * Returns sum in dollars (converted from cents).
 * Clamps intermediate calculations to int32 range to match C behavior.
 */
export async function sumByType(
  amountsCents: Int32Array,
  typeFlags: Int32Array,
  filterType: "income" | "expense"
): Promise<number> {
  const length = amountsCents.length;

  if (!amountsCents || !typeFlags || length <= 0) {
    return Promise.resolve(0);
  }

  if (length !== typeFlags.length) {
    throw new Error("Array lengths must match");
  }

  const filterTypeValue = filterType === "income" ? 1 : 0;
  let total = 0;

  for (let i = 0; i < length; i++) {
    if (typeFlags[i] === filterTypeValue) {
      total += amountsCents[i];
    }
  }

  // Clamp to int32 range (matching C behavior)
  const clampedTotal = clampToInt32(total);

  // Return in dollars (divide by 100)
  return Promise.resolve(clampedTotal / 100);
}

/**
 * Calculate running balances for transactions.
 * amountsCents: array of amounts in cents
 * typeFlags: 0 for expense, 1 for income
 * startBalance: starting balance in dollars
 * Returns array of {before, after} balance pairs in dollars.
 * Clamps intermediate calculations to int32 range to match C behavior.
 */
export async function calculateRunningBalances(
  amountsCents: Int32Array,
  typeFlags: Int32Array,
  startBalance: number
): Promise<Array<{ before: number; after: number }>> {
  const length = amountsCents.length;

  if (!amountsCents || !typeFlags || length <= 0) {
    return Promise.resolve([]);
  }

  if (length !== typeFlags.length) {
    throw new Error("Array lengths must match");
  }

  const balances: Array<{ before: number; after: number }> = [];
  let runningBalanceCents = Math.round(startBalance * 100);

  for (let i = 0; i < length; i++) {
    const balanceBeforeCents = runningBalanceCents;

    // Apply transaction: income adds, expense subtracts
    const amountChange =
      typeFlags[i] === 1 ? amountsCents[i] : -amountsCents[i];

    const balanceAfterCents = runningBalanceCents + amountChange;

    // Clamp to int32 range for output (matching C behavior)
    // But keep the actual running balance for subsequent calculations
    const clampedBefore = clampToInt32(balanceBeforeCents);
    const clampedAfter = clampToInt32(balanceAfterCents);

    balances.push({
      before: clampedBefore / 100,
      after: clampedAfter / 100,
    });

    // Use the actual (unclamped) balance for the next transaction
    // to maintain accurate balance chain
    runningBalanceCents = balanceAfterCents;
  }

  return Promise.resolve(balances);
}
