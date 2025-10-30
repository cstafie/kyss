#!/bin/sh

echo "Injecting environment variables into index.html..."

# Inject env vars into index.html
envsubst < ./dist/index.html > ./dist/index.html.tmp
mv ./dist/index.html.tmp ./dist/index.html

echo "Starting the server..."

exec serve dist -l 3000