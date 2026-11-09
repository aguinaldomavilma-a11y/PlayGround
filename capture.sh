#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$PROJECT_DIR"
: "${CAPTURE_URL:?Set CAPTURE_URL to the exact preview URL}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR to the evidence output directory}"

# The runtime capture helper classifies browser/navigation outages as temporary
# (75), checks page errors as rendering defects (1), and always closes its browser.
export CAPTURE_STRICT=1
RUNTIME_DIR="${RUNTIME_DIR:-/home/runner/work/_temp/omgithub-runtime}"
/usr/bin/time -p node "$RUNTIME_DIR/scripts/default-capture.mjs"
