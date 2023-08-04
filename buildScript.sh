#!/bin/bash

# Stop script if any command fails
set -e

echo "Building proxy-handler..."
docker build -t proxy-handler ./ProxyHandler

echo "Building nordVpnProxy..."
docker build -t nordvpn ./NordVPNProxy

echo "Successfully built all Docker images."
