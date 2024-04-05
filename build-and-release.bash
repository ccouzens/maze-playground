set -e

# rustup target add wasm32-unknown-unknown

(cd esbuild; go run .)

VERSION="$(git rev-parse HEAD)"

gsutil \
  -Z \
  -h "Content-Type:text/plain" \
  cp \
  "build/frag-*.glsl" \
  "build/vert-*.glsl" \
  "build/shader-*.wgsl" \
  gs://maze-playground/

gsutil \
  -Z \
  -h "Content-Type:application/wasm" \
  cp \
  "build/*.wasm" \
  gs://maze-playground/

gsutil \
  -Z \
  -h "Content-Type:text/javascript" \
  cp \
  "build/*.js" \
  gs://maze-playground/
  
gsutil \
  -Z \
  -h "Content-Type:text/css" \
  cp \
  "build/*.css" \
  gs://maze-playground/
  
gsutil \
  -Z \
  -h "Content-Type:application/json" \
  cp \
  "build/*.js.map" \
  "build/*.css.map" \
  gs://maze-playground/

gsutil \
  -Z \
  -h "Content-Type:text/html" \
  cp \
  "build/rendering-playground.html" \
  "build/game.html" \
  gs://maze-playground/

gsutil \
  -Z \
  -h "Content-Type:text/html" \
  cp \
  "build/rendering-playground.html" \
  "gs://maze-playground/rendering-playground-${VERSION}.html"

gsutil \
  -Z \
  -h "Content-Type:text/html" \
  cp \
  "build/game.html" \
  "gs://maze-playground/game-${VERSION}.html"
