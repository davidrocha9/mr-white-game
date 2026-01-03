#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Start client (bind to all interfaces)
bun dev ./client -- --host 0.0.0.0 &
client_pid=$!

# Start server
bun dev ./server &
server_pid=$!

trap 'kill "$client_pid" "$server_pid" 2>/dev/null || true' EXIT

# Wait for the first process to exit and capture its status
wait -n
exit_code=$?

# Ensure both background processes are terminated
kill "$client_pid" "$server_pid" 2>/dev/null || true
wait || true

exit $exit_code
