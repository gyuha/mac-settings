#!/usr/bin/env bash
set -euo pipefail

if [[ $# -eq 0 ]]; then
  set -- 3000
fi

for PORT in "$@"; do
  if ! [[ ${PORT} =~ ^[0-9]+$ ]]; then
    echo "Port must be a positive integer: ${PORT}" >&2
    continue
  fi

  pids=$(lsof -ti ":${PORT}" || true)

  if [[ -z "${pids}" ]]; then
    echo "No process is listening on port ${PORT}."
    continue
  fi

  echo "Killing processes on port ${PORT}: ${pids}".
  # shellcheck disable=SC2086
  kill -9 ${pids}
done
