set -e

# rustup target add wasm32-unknown-unknown
# apt-get install binaryen
# dnf install binaryen
# brew install binaryen

(cd www; ./build.bash)
(cd www; npm install)
(cd www; npm run build)

VERSION="$(git rev-parse HEAD)"
mkdir -p build
sed "s/-LATEST/-${VERSION}/g" < www/public/index.html > build/index.html
sed "s/-LATEST/-${VERSION}/g" < www/public/script-LATEST.js > "build/script-${VERSION}.js"
sed "s/-LATEST/-${VERSION}/g" < www/public/script-LATEST.js.map > "build/script-${VERSION}.js.map"
cp www/public/computer-LATEST.wasm "build/computer-${VERSION}.wasm"
cp www/public/frag-LATEST.glsl "build/frag-${VERSION}.glsl"
cp www/public/vert-LATEST.glsl "build/vert-${VERSION}.glsl"
cp www/public/shader-LATEST.wgsl "build/shader-${VERSION}.wgsl"

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
  -h "Content-Type:application/json" \
  cp \
  "build/script-${VERSION}.js.map" \
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
