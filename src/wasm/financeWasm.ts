type WasmFinanceModule = {
  HEAP32: Int32Array;
  _sum_int32(ptr: number, length: number): number;
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
