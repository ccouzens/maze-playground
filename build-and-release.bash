set -ex

# rustup target add wasm32-unknown-unknown

(cd esbuild; go run .)

VERSION="$(git rev-parse HEAD)"

cp build/game.html "build/game-${VERSION}.html"
cp build/rendering-playground.html "build/rendering-playground-${VERSION}.html"

ls -- build

gsutil \
  -h "Content-Type:text/plain" \
  cp \
  -Z \
  build/*.glsl \
  build/*.wgsl \
  gs://maze-playground/

gsutil \
  -h "Content-Type:application/wasm" \
  cp \
  -Z \
  build/*.wasm \
  gs://maze-playground/
  
gsutil \
  -h "Content-Type:application/json" \
  cp \
  -Z \
  build/*.js.map \
  build/*.css.map \
  gs://maze-playground/

gsutil \
  cp \
  -Z \
  build/*.js \
  build/*.css \
  build/*.html \
  gs://maze-playground/
