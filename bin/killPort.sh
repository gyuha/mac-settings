#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 1 ]]; then
  echo "Usage: $(basename "$0") [port]" >&2
  exit 1
fi

PORT=${1:-3000}

if ! [[ ${PORT} =~ ^[0-9]+$ ]]; then
  echo "Port must be a positive integer." >&2
  exit 1
fi

pids=$(lsof -ti ":${PORT}" || true)

if [[ -z "${pids}" ]]; then
  echo "No process is listening on port ${PORT}."
  exit 0
fi

echo "Killing processes on port ${PORT}: ${pids}".
# shellcheck disable=SC2086
kill -9 ${pids}


