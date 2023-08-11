#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Stop script if any command fails
set -e

# Header
echo -e "${GREEN}--------------------------------------"
echo -e "      NordVPN-proxies Start Script      "
echo -e "--------------------------------------${NC}"
echo ""

progress() {
  echo -e "${GREEN}[+]${NC} $1"
}

error() {
  echo -e "${RED}[-]${NC} Error: $1" >&2
  exit 1
}

help() {
    echo "Usage: $0 [dev]"
    echo ""
    echo "Arguments:"
    echo "  dev            Optional. If specified, starts the compose in attached mode."
    echo ""
    echo "Ensure the vpn-config.json file is correctly set up in the same directory."
    echo "The file should have entries in the following format:"
    echo '[
      {
        "NORDVPN_TOKEN": "your_token_here",
        "CONNECT_OPTION": "option_here",
        "COUNT": 2
      },
      ...
    ]'
    echo "Each entry specifies an account and the number of VPN containers for that account."
    exit 0
}

# Check for -help
if [[ "$1" == "-help" ]]; then
    help
fi

generate_compose_file() {
    local vpn_services=""
    local vpn_dependencies=""
    local vpn_options=""
    local counter=1

     while IFS= read -r config; do
        local token=$(echo $config | jq -r '.NORDVPN_TOKEN')
        local connect_option=$(echo $config | jq -r '.CONNECT_OPTION')
        local count=$(echo $config | jq -r '.COUNT')
        local option_for_vpn="vpn$counter:$connect_option"
        vpn_options="$vpn_options $option_for_vpn"

        for i in $(seq 1 $count); do
            vpn_services="$vpn_services
  vpn$counter:
    image: nordvpn
    container_name: vpn$counter
    cap_add:
      - NET_ADMIN
    environment:
      NORDVPN_TOKEN : $token
      CONNECT_OPTION : $connect_option
    networks:
      - proxy-network
    depends_on:
      - connection-handler"

            if [ -z "$vpn_dependencies" ]; then
        vpn_dependencies="- vpn$counter"
    else
        vpn_dependencies="$vpn_dependencies
      - vpn$counter"
        fi
            counter=$((counter+1))
        done
    done < <(jq -c '.[]' vpn-config.json)

    # Replace placeholders in docker-compose template with generated values using awk
    awk -v vpn_services="$vpn_services" '{gsub(/\{VPN_SERVICES\}/, vpn_services); print}' docker-compose.template.yml > docker-compose.intermediate.yml
    awk -v vpn_dependencies="$vpn_dependencies" '{gsub(/\{VPN_DEPENDENCIES\}/, vpn_dependencies); print}' docker-compose.intermediate.yml > docker-compose.yml
    rm docker-compose.intermediate.yml

    progress "Modifying the ProxyHandler file..."
    vpn_total_count=$(jq '. | length' vpn-config.json)
    node utils/Config.js "$vpn_total_count" "$vpn_options" || error "Failed to generate configurations"
}

# Shutting down compose
progress "Shutting down compose..."
docker compose down || error "Failed to shut down compose"

# Generate the docker-compose file based on vpn-config.json
progress "Generating docker-compose.yml..."
generate_compose_file

# Building images
progress "Building images..."
bash buildScript.sh || error "Failed to build images"

# Starting compose
if [[ "$1" == "dev" ]]; then
    progress "Starting compose in dev mode..."
    docker compose up || error "Failed to start compose in attached mode"
else
    progress "Starting compose in detached mode..."
    docker compose up -d || error "Failed to start compose in detached mode"
fi

echo -e "${GREEN}[+] Done!${NC}"
