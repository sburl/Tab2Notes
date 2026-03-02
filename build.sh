#!/bin/bash

# Name of the output zip file
ZIP_NAME="tab2notes.zip"

# Clean up any existing zip file
if [ -f "$ZIP_NAME" ]; then
  rm "$ZIP_NAME"
fi

# Create a zip file containing the extension files
zip -r "$ZIP_NAME" . -x "*.git*" "*node_modules*" "*.DS_Store*" "*.github*" "build.sh" "test_url_logic.js" "package*.json" ".*" "ASSESSMENT_AND_PLAN.md"

echo "Build complete: $ZIP_NAME"
