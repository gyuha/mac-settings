#!/usr/bin/env bash
set -euo pipefail

PORT=3000

pids=$(lsof -ti ":${PORT}" || true)

if [[ -z "${pids}" ]]; then
  echo "No process is listening on port ${PORT}."
  exit 0
fi

echo "Killing processes on port ${PORT}: ${pids}".
# shellcheck disable=SC2086
kill -9 ${pids}



