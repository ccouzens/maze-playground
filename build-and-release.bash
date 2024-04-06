set -ex

# rustup target add wasm32-unknown-unknown

(cd esbuild; go run .)

VERSION="$(git rev-parse HEAD)"

cp build/game.html "build/game-${VERSION}.html"
cp build/rendering-playground.html "build/rendering-playground-${VERSION}.html"
cp build/rendering-playground.html "build/index.html"

ls -- build

gsutil \
  -m \
  -h "Content-Type:text/plain" \
  cp \
  -Z \
  build/*.glsl \
  build/*.wgsl \
  gs://maze-playground/

gsutil \
  -m \
  -h "Content-Type:application/json" \
  cp \
  -Z \
  build/*.js.map \
  build/*.css.map \
  gs://maze-playground/

gsutil \
  -m \
  cp \
  -Z \
  build/*.wasm \
  build/*.js \
  build/*.css \
  build/*.html \
  gs://maze-playground/
