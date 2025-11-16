type WasmFinanceModule = {
  HEAP32: Int32Array;
  HEAP64: BigInt64Array;
  _sum_int32(ptr: number, length: number): number;
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

export async function sumByCategory(
  categoryIndex: number,
  startTs: bigint,
  endTs: bigint,
  timestamps: BigInt64Array,
  amounts: Int32Array,
  categoryIndices: Int32Array
): Promise<number> {
  const module = await initFinanceWasm();

  const length = amounts.length;
  if (length !== timestamps.length || length !== categoryIndices.length) {
    throw new Error("Array lengths must match");
  }

  const tsBytes = length * BigInt64Array.BYTES_PER_ELEMENT;
  const amtBytes = length * Int32Array.BYTES_PER_ELEMENT;
  const catBytes = length * Int32Array.BYTES_PER_ELEMENT;

  const tsPtr = module._malloc(tsBytes);
  const amtPtr = module._malloc(amtBytes);
  const catPtr = module._malloc(catBytes);

  try {
    const tsHeapIndex = tsPtr / BigInt64Array.BYTES_PER_ELEMENT;
    const amtHeapIndex = amtPtr / Int32Array.BYTES_PER_ELEMENT;
    const catHeapIndex = catPtr / Int32Array.BYTES_PER_ELEMENT;

    module.HEAP64.set(timestamps, tsHeapIndex);
    module.HEAP32.set(amounts, amtHeapIndex);
    module.HEAP32.set(categoryIndices, catHeapIndex);

    const result = module._sum_by_category(categoryIndex, startTs, endTs, tsPtr, amtPtr, catPtr, length);
    return result;
  } finally {
    module._free(tsPtr);
    module._free(amtPtr);
    module._free(catPtr);
  }
}

export async function sumByMonth(
  year: number,
  month: number,
  timestamps: BigInt64Array,
  amounts: Int32Array
): Promise<number> {
  const module = await initFinanceWasm();

  const length = amounts.length;
  if (length !== timestamps.length) {
    throw new Error("Array lengths must match");
  }

  const tsBytes = length * BigInt64Array.BYTES_PER_ELEMENT;
  const amtBytes = length * Int32Array.BYTES_PER_ELEMENT;

  const tsPtr = module._malloc(tsBytes);
  const amtPtr = module._malloc(amtBytes);

  try {
    const tsHeapIndex = tsPtr / BigInt64Array.BYTES_PER_ELEMENT;
    const amtHeapIndex = amtPtr / Int32Array.BYTES_PER_ELEMENT;

    module.HEAP64.set(timestamps, tsHeapIndex);
    module.HEAP32.set(amounts, amtHeapIndex);

    const result = module._sum_by_month(year, month, tsPtr, amtPtr, length);
    return result;
  } finally {
    module._free(tsPtr);
    module._free(amtPtr);
  }
}
