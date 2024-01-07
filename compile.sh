rm -r dist/*
npx parcel build ./src/index.html
cp -r src/assets dist