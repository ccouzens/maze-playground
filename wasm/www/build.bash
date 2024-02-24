#!/usr/bin/env bash
set -e

(cd ..; cargo build --target=wasm32-unknown-unknown --release)
make -C ../.. wasm/www/public/computer-LATEST.wasm

