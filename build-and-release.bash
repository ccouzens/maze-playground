set -ex

# rustup target add wasm32-unknown-unknown

(cd esbuild; go run .)

VERSION="$(git rev-parse HEAD)"

cp build/game.html "build/game-${VERSION}.html"
cp build/rendering-playground.html "build/rendering-playground-${VERSION}.html"

ls -- build

gsutil \
  -h "Content-Type:text/plain" \
  -Z \
  cp \
  build/*.glsl \
  build/*.wgsl \
  gs://maze-playground/

gsutil \
  -h "Content-Type:application/wasm" \
  -Z \
  cp \
  build/*.wasm \
  gs://maze-playground/
  
gsutil \
  -h "Content-Type:application/json" \
  -Z \
  cp \
  build/*.js.map \
  build/*.css.map \
  gs://maze-playground/

gsutil \
  -Z \
  cp \
  build/*.js \
  build/*.css \
  build/*.html \
  gs://maze-playground/
