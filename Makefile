www/public/computer-LATEST.wasm: target/wasm32-unknown-unknown/release/wasm.wasm
	wasm-opt -O3 -o $@ $< || cp $< $@

.PHONY : clean
clean :
	cargo clean
	rm -f www/public/computer-LATEST.wasm www/public/*.js
