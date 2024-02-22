wasm/www/public/computer.wasm: target/wasm32-unknown-unknown/release/wasm.wasm
	wasm-opt -O3 -o $@ $<

.PHONY : clean
clean :
	cargo clean
	rm wasm/www/public/computer.wasm

