set -e

# rustup target add wasm32-unknown-unknown

(cd esbuild; go run .)

VERSION="$(git rev-parse HEAD)"

gsutil \
  cp \
  -Z \
  -h "Content-Type:text/plain" \
  "build/frag-*.glsl" \
  "build/vert-*.glsl" \
  "build/shader-*.wgsl" \
  gs://maze-playground/

gsutil \
  cp \
  -Z \
  -h "Content-Type:application/wasm" \
  "build/*.wasm" \
  gs://maze-playground/

gsutil \
  cp \
  -Z \
  -h "Content-Type:text/javascript" \
  "build/*.js" \
  gs://maze-playground/
  
gsutil \
  cp \
  -Z \
  -h "Content-Type:text/css" \
  "build/*.css" \
  gs://maze-playground/
  
gsutil \
  cp \
  -Z \
  -h "Content-Type:application/json" \
  "build/*.js.map" \
  "build/*.css.map" \
  gs://maze-playground/

gsutil \
  cp \
  -Z \
  -h "Content-Type:text/html" \
  "build/rendering-playground.html" \
  "build/game.html" \
  gs://maze-playground/

gsutil \
  cp \
  -Z \
  -h "Content-Type:text/html" \
  "build/rendering-playground.html" \
  "gs://maze-playground/rendering-playground-${VERSION}.html"

gsutil \
  cp \
  -Z \
  -h "Content-Type:text/html" \
  "build/game.html" \
  "gs://maze-playground/game-${VERSION}.html"
