set -e

# rustup target add wasm32-unknown-unknown

npm install
node build.mjs

VERSION="$(git rev-parse HEAD)"

gsutil \
  -h "Content-Type:text/plain" \
  cp \
  "build/frag-*.glsl" \
  "build/vert-*.glsl" \
  "build/shader-*.wgsl" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:application/wasm" \
  cp \
  "build/computer-*.wasm" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:text/javascript" \
  cp \
  "build/script-*.js" \
  gs://maze-playground/
  
gsutil \
  -h "Content-Type:text/css" \
  cp \
  "build/style-*.css" \
  gs://maze-playground/
  
gsutil \
  -h "Content-Type:application/json" \
  cp \
  "build/script-*.js.map" \
  "build/style-*.css.map" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:text/html" \
  cp \
  "build/index.html" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:text/html" \
  cp \
  "build/index.html" \
  "gs://maze-playground/index-${VERSION}.html"
