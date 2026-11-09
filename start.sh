#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$PROJECT_DIR"
PORT="${PORT:-3000}"
[[ "$PORT" =~ ^[0-9]+$ ]] && (( PORT > 0 && PORT <= 65535 )) || { echo "Invalid PORT: $PORT" >&2; exit 1; }
export PORT

# This project is static and has no external package dependencies, but run npm's
# install step so the startup contract remains valid if dependencies are added.
/usr/bin/time -p npm install --ignore-scripts --no-audit --no-fund --package-lock=false

# Build the deployable static site entirely within the project directory.
/usr/bin/time -p mkdir -p "$PROJECT_DIR/dist"
/usr/bin/time -p cp -a index.html css js "$PROJECT_DIR/dist/"

metadata_dir="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$metadata_dir"
/usr/bin/time -p node -e 'const fs=require("node:fs"); const path=require("node:path"); const project=process.argv[1]; const output=process.argv[2]; fs.writeFileSync(output, JSON.stringify({project, directory:path.join(project,"dist")})+"\n")' "$PROJECT_DIR" "$metadata_dir/deployment-output.json"

# Keep the server in the foreground for the controller-owned tmux session.
exec /usr/bin/time -p python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$PROJECT_DIR/dist"
