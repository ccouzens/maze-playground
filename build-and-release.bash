set -ex

# rustup target add wasm32-unknown-unknown

(cd esbuild; go run .)

VERSION="$(git rev-parse HEAD)"

cp build/game.html "build/game-${VERSION}.html"
cp build/rendering-playground.html "build/rendering-playground-${VERSION}.html"

ls -- build

gsutil cp \
  -h "Content-Type:text/plain" \
  -Z \
  build/*.glsl \
  build/*.wgsl \
  gs://maze-playground/

gsutil cp \
  -h "Content-Type:application/wasm" \
  -Z \
  build/*.wasm \
  gs://maze-playground/
  
gsutil cp \
  -h "Content-Type:application/json" \
  -Z \
  build/*.js.map \
  build/*.css.map \
  gs://maze-playground/

gsutil cp \
  -Z \
  build/*.js \
  build/*.css \
  build/*.html \
  gs://maze-playground/
