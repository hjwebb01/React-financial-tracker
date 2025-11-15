#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="./dist"
mkdir -p "$OUT_DIR"


emcc sum.c \
  -Os \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createWasmFinanceModule" \
  -s EXPORTED_FUNCTIONS="['_sum_int32','_malloc','_free']" \
  -s EXPORTED_RUNTIME_METHODS="['HEAP32']" \
  -o "$OUT_DIR/wasm-finance.js"