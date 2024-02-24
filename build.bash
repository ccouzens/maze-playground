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

curl -X POST --data-binary "@build/bundle-${VERSION}.js" \
    --fail-with-body \
    -H "Authorization: Bearer ${GCP_TOKEN}" \
    -H "Content-Type: application/javascript" \
    -H "Cache-Control: public, max-age=31536000" \
    "https://storage.googleapis.com/upload/storage/v1/b/maze-playground/o?uploadType=media&name=bundle-${VERSION}.js"

curl -X POST --data-binary "@build/computer-${VERSION}.wasm" \
    --fail-with-body \
    -H "Authorization: Bearer ${GCP_TOKEN}" \
    -H "Content-Type: application/wasm" \
    -H "Cache-Control: public, max-age=31536000" \
    "https://storage.googleapis.com/upload/storage/v1/b/maze-playground/o?uploadType=media&name=computer-${VERSION}.wasm"

curl -X POST --data-binary "@build/frag-${VERSION}.glsl" \
    --fail-with-body \
    -H "Authorization: Bearer ${GCP_TOKEN}" \
    -H "Content-Type: text/plain" \
    -H "Cache-Control: public, max-age=31536000" \
    "https://storage.googleapis.com/upload/storage/v1/b/maze-playground/o?uploadType=media&name=frag-${VERSION}.glsl"

curl -X POST --data-binary "@build/vert-${VERSION}.glsl" \
    --fail-with-body \
    -H "Authorization: Bearer ${GCP_TOKEN}" \
    -H "Content-Type: text/plain" \
    -H "Cache-Control: public, max-age=31536000" \
    "https://storage.googleapis.com/upload/storage/v1/b/maze-playground/o?uploadType=media&name=vert-${VERSION}.glsl"

curl -X POST --data-binary "@build/index.html" \
    --fail-with-body \
    -H "Authorization: Bearer ${GCP_TOKEN}" \
    -H "Content-Type: text/html" \
    "https://storage.googleapis.com/upload/storage/v1/b/maze-playground/o?uploadType=media&name=index.html"

