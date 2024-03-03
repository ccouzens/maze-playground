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
sed "s/-LATEST/-${VERSION}/g" < wasm/www/public/bundle-LATEST.js > "build/bundle-${VERSION}.js"
cp wasm/www/public/computer-LATEST.wasm "build/computer-${VERSION}.wasm"
cp wasm/www/public/frag-LATEST.glsl "build/frag-${VERSION}.glsl"
cp wasm/www/public/vert-LATEST.glsl "build/vert-${VERSION}.glsl"

gsutil cp \
  "build/*" \
  gs://maze-playground/

