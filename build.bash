set -e

# rustup target add wasm32-unknown-unknown
# apt-get install binaryen
# dnf install binaryen
# brew install binaryen

(cd wasm/www; ./build.bash)
(cd wasm/www; npm install)
(cd wasm/www; npm run build)

VERSION="$(git rev-parse HEAD)"
mkdir -p build
sed "s/-LATEST/-${VERSION}/g" < wasm/www/public/index.html > build/index.html
sed "s/-LATEST/-${VERSION}/g" < wasm/www/public/script-LATEST.js > "build/script-${VERSION}.js"
cp wasm/www/public/computer-LATEST.wasm "build/computer-${VERSION}.wasm"
cp wasm/www/public/frag-LATEST.glsl "build/frag-${VERSION}.glsl"
cp wasm/www/public/vert-LATEST.glsl "build/vert-${VERSION}.glsl"
cp wasm/www/public/shader-LATEST.wgsl "build/shader-${VERSION}.wgsl"

gsutil \
  -h "Content-Type:text/plain" \
  cp \
  "build/frag-${VERSION}.glsl" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:text/plain" \
  cp \
  "build/vert-${VERSION}.glsl" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:text/plain" \
  cp \
  "build/shader-${VERSION}.wgsl" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:application/wasm" \
  cp \
  "build/computer-${VERSION}.wasm" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:text/javascript" \
  cp \
  "build/script-${VERSION}.js" \
  gs://maze-playground/

gsutil \
  -h "Content-Type:text/html" \
  cp \
  "build/index.html" \
  gs://maze-playground/
