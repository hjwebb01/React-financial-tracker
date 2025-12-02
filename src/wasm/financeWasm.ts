type WasmFinanceModule = {
  HEAP32: Int32Array;
  HEAP64: BigInt64Array;
  _sum_int32(ptr: number, length: number): number;
  _sum_by_type(amountsPtr: number, typeFlagsPtr: number, length: number, filterType: number): number;
  _calculate_running_balances(amountsPtr: number, typeFlagsPtr: number, startBalanceCents: number, outputPtr: number, length: number): void;
  _sum_by_category(categoryIndex: number, startTs: bigint, endTs: bigint, tsPtr: number, amtPtr: number, catPtr: number, length: number): number;
  _sum_by_month(year: number, month: number, tsPtr: number, amtPtr: number, length: number): number;
  _malloc(size: number): number;
  _free(ptr: number): void;
};

type CreateWasmFinanceModuleType = (
  options?: Record<string, unknown>
) => Promise<WasmFinanceModule>;

declare const createWasmFinanceModule: CreateWasmFinanceModuleType | undefined;

let wasmModulePromise: Promise<WasmFinanceModule> | null = null;

export function initFinanceWasm(): Promise<WasmFinanceModule> {
  if (!wasmModulePromise) {
    wasmModulePromise = new Promise((resolve, reject) => {
      if (typeof createWasmFinanceModule !== "function") {
        reject(
          new Error(
            "createWasmFinanceModule is not available. Ensure /wasm-finance/wasm-finance.js is loaded via a <script> tag."
          )
        );
        return;
      }

      createWasmFinanceModule({
        locateFile: (path: string) => `/wasm-finance/${path}`,
      })
        .then(resolve)
        .catch(reject);
    });
  }

  return wasmModulePromise;
}

export async function sumInt32(values: Int32Array): Promise<number> {
  const module = await initFinanceWasm();

  const bytes = values.length * Int32Array.BYTES_PER_ELEMENT;
  const ptr = module._malloc(bytes);

  try {
    const heapIndex = ptr / Int32Array.BYTES_PER_ELEMENT;
    module.HEAP32.set(values, heapIndex);

    const result = module._sum_int32(ptr, values.length);
    return result;
  } finally {
    module._free(ptr);
  }
}

export async function sumByType(
  amountsCents: Int32Array,
  typeFlags: Int32Array,
  filterType: "income" | "expense"
): Promise<number> {
  const module = await initFinanceWasm();

  const length = amountsCents.length;
  if (length !== typeFlags.length) {
    throw new Error("Array lengths must match");
  }

  if (length === 0) {
    return 0;
  }

  const amountsBytes = length * Int32Array.BYTES_PER_ELEMENT;
  const typesBytes = length * Int32Array.BYTES_PER_ELEMENT;

  const amountsPtr = module._malloc(amountsBytes);
  const typesPtr = module._malloc(typesBytes);

  try {
    const amountsHeapIndex = amountsPtr / Int32Array.BYTES_PER_ELEMENT;
    const typesHeapIndex = typesPtr / Int32Array.BYTES_PER_ELEMENT;

    module.HEAP32.set(amountsCents, amountsHeapIndex);
    module.HEAP32.set(typeFlags, typesHeapIndex);

    const filterTypeValue = filterType === "income" ? 1 : 0;
    const resultCents = module._sum_by_type(amountsPtr, typesPtr, length, filterTypeValue);
    return resultCents / 100;
  } finally {
    module._free(amountsPtr);
    module._free(typesPtr);
  }
}

export async function calculateRunningBalances(
  amountsCents: Int32Array,
  typeFlags: Int32Array,
  startBalance: number
): Promise<Array<{ before: number; after: number }>> {
  const module = await initFinanceWasm();

  const length = amountsCents.length;
  if (length !== typeFlags.length) {
    throw new Error("Array lengths must match");
  }

  if (length === 0) {
    return [];
  }

  const amountsBytes = length * Int32Array.BYTES_PER_ELEMENT;
  const typesBytes = length * Int32Array.BYTES_PER_ELEMENT;
  const outputBytes = length * 2 * Int32Array.BYTES_PER_ELEMENT;

  const amountsPtr = module._malloc(amountsBytes);
  const typesPtr = module._malloc(typesBytes);
  const outputPtr = module._malloc(outputBytes);

  try {
    const amountsHeapIndex = amountsPtr / Int32Array.BYTES_PER_ELEMENT;
    const typesHeapIndex = typesPtr / Int32Array.BYTES_PER_ELEMENT;

    module.HEAP32.set(amountsCents, amountsHeapIndex);
    module.HEAP32.set(typeFlags, typesHeapIndex);

    const startBalanceCents = Math.round(startBalance * 100);
    module._calculate_running_balances(amountsPtr, typesPtr, startBalanceCents, outputPtr, length);

    const results = new Int32Array(module.HEAP32.buffer, outputPtr, length * 2);
    const balances: Array<{ before: number; after: number }> = [];
    for (let i = 0; i < length; i++) {
      balances.push({
        before: results[i * 2] / 100,
        after: results[i * 2 + 1] / 100,
      });
    }

    return balances;
  } finally {
    module._free(amountsPtr);
    module._free(typesPtr);
    module._free(outputPtr);
  }
}

