#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Stop script if any command fails
set -e

spinner() {
    local pid=$1
    local delay=0.75
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

build_docker_image() {
    local name="$1"
    local tag="$2"
    local path="$3"
    local build_args="$4"

    printf "${YELLOW}Building $name...${NC}"
    (docker build $build_args -t $tag $path > /dev/null 2>&1) &
    spinner $!
    echo -e " ${GREEN}✔${NC} Done building $name."
}

echo -e "${YELLOW}[+] Building images...${NC}"
build_docker_image "proxy-handler" "proxy-handler" "ProxyHandler" "--build-arg CONNECT_OPTION=${CONNECT_OPTION}"
build_docker_image "nordVpnProxy" "nordvpn" "NordVPNProxy"

echo -e "${GREEN}Successfully built all Docker images.${NC}"
echo -e "${YELLOW}[+] Starting compose...${NC}"
