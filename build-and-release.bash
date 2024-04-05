set -ex

# rustup target add wasm32-unknown-unknown

(cd esbuild; go run .)

VERSION="$(git rev-parse HEAD)"

cp build/game.html "build/game-${VERSION}.html"
cp build/rendering-playground.html "build/rendering-playground-${VERSION}.html"

gsutil \
  cp \
  -h "Content-Type:text/plain" \
  "build/frag-*.glsl" \
  "build/vert-*.glsl" \
  "build/shader-*.wgsl" \
  gs://maze-playground/

gsutil \
  cp \
  -h "Content-Type:application/wasm" \
  "build/*.wasm" \
  gs://maze-playground/
  
gsutil \
  cp \
  -h "Content-Type:application/json" \
  "build/*.js.map" \
  "build/*.css.map" \
  gs://maze-playground/

gsutil \
  cp \
  "build/*.js" \
  "build/*.css" \
  "build/*.html" \
  gs://maze-playground/
