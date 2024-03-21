www/public/computer.wasm: target/wasm32-unknown-unknown/release/maze_playground.wasm
	wasm-opt -O3 -o $@ $< || cp $< $@

.PHONY : clean
clean :
	cargo clean
	rm -f www/public/computer.wasm www/build/ 
