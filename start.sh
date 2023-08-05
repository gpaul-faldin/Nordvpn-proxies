#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Stop script if any command fails
set -e

clear

# Header
echo -e "${GREEN}--------------------------------------"
echo -e "      NordVPN Proxy Setup Script      "
echo -e "--------------------------------------${NC}"
echo ""

progress() {
  echo -e "${GREEN}[+]${NC} $1"
}

error() {
  echo -e "${RED}[-]${NC} Error: $1" >&2
  exit 1
}


export_env() {
    local env_name="$1"
    local default_value="$2"

    if [ -z "${!env_name}" ]; then
        # if the variable is not set, then set it
        export $env_name=$default_value
        echo -e "   Setting ${GREEN}$env_name${NC}"
    else
        echo -e "   Using existing value for ${GREEN}$env_name${NC}"
    fi
}

# Exporting ENV variables
progress "Exporting ENV variables"
export_env "NORDVPN_TOKEN" "<YOUR-KEY-HERE>"
export_env "CONNECT_OPTION" ""


# Shutting down compose
progress "Shutting down compose..."
docker compose down || error "Failed to shut down compose"

# Building images
progress "Building images..."
bash buildScript.sh || error "Failed to build images"

# Starting compose
progress "Starting compose..."
docker compose up -d || error "Failed to start compose"

echo -e "${GREEN}[+] Done!${NC}"
