set -ex

curl --silent -L https://github.com/WebAssembly/binaryen/releases/download/version_129/binaryen-version_129-x86_64-linux.tar.gz | tar -xz
export PATH="$PATH:$(pwd)/binaryen-version_129/bin"

# rustup target add wasm32-unknown-unknown
# pnpm install

pnpm exec turbo build

VERSION="$(git rev-parse HEAD)"

cp dist/index.html "dist/game-${VERSION}.html"
cp dist/index.html "dist/game.html"
cp dist/rendering-playground.html "dist/rendering-playground-${VERSION}.html"

ls -- dist

gsutil \
  -m \
  -h "Content-Type:text/plain" \
  cp \
  -Z \
  dist/assets/*.glsl \
  dist/assets/*.wgsl \
  gs://maze-playground/assets/

gsutil \
  -m \
  -h "Content-Type:application/json" \
  cp \
  -Z \
  dist/assets/*.js.map \
  gs://maze-playground/assets/

gsutil \
  -m \
  cp \
  -Z \
  dist/assets/*.wasm \
  dist/assets/*.js \
  dist/assets/*.css \
  dist/assets/*.json \
  dist/assets/*.svg \
  dist/assets/*.png \
  gs://maze-playground/assets/

gsutil \
  -m \
  cp \
  -Z \
  dist/*.html \
  gs://maze-playground/
