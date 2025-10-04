#!/bin/bash

set -euo pipefail

echo "Currently open ports:"
echo "===================="

print_lsof() {
    # Group listeners by port to avoid duplicate rows from IPv4/IPv6 bindings or SO_REUSEPORT workers
    lsof -nP -iTCP -sTCP:LISTEN | awk '
        NR == 1 { next }
        {
            name = $9
            for (i = 10; i <= NF; ++i) {
                name = name " " $i
            }

            sub(/ \(LISTEN\)$/, "", name)

            port = name
            sub(/.*:/, "", port)

            if (port !~ /^[0-9]+$/) {
                next
            }
            key = port
            listener = $1 " (" $2 ")"

            if (!seen_port[key]++) {
                order[++count] = key
            }

            if (!seen_listener[key ":" listener]++) {
                listeners[key] = listeners[key] (listeners[key] ? ", " : "") listener
            }

            if (!seen_addr[key ":" name]++) {
                addresses[key] = addresses[key] (addresses[key] ? ", " : "") name
            }
        }
        END {
            if (count == 0) {
                print "No TCP listeners found."
                exit
            }

            printf "%-6s  %-35s  %s\n", "PORT", "LISTENERS", "ADDRESSES"
            for (i = 1; i <= count; ++i) {
                key = order[i]
                printf "%-6s  %-35s  %s\n", key, listeners[key], addresses[key]
            }
        }
    '
}

print_netstat() {
    # Fallback: group by port using the local address column
    netstat -anv | awk '
        /LISTEN/ {
            addr = $4
            port = addr
            sub(/.*\./, "", port)
            sub(/\.[0-9]+$/, "", addr)

            if (port !~ /^[0-9]+$/) {
                next
            }

            if (!seen_port[port]++) {
                order[++count] = port
            }

            if (!seen_addr[port ":" addr]++) {
                addresses[port] = addresses[port] (addresses[port] ? ", " : "") addr
            }
        }
        END {
            if (count == 0) {
                print "No TCP listeners found."
                exit
            }

            printf "%-6s  %s\n", "PORT", "ADDRESSES"
            for (i = 1; i <= count; ++i) {
                port = order[i]
                printf "%-6s  %s\n", port, addresses[port]
            }
        }
    '
}

if command -v lsof >/dev/null 2>&1; then
    print_lsof
else
    echo "lsof command not found. Trying netstat..."

    if command -v netstat >/dev/null 2>&1; then
        print_netstat
    else
        echo "Neither lsof nor netstat is available."
        exit 1
    fi
fi

echo "===================="
