FROM ubuntu:20.04

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

# Update the package lists and install sudo
RUN apt-get update \
    && apt-get install -y sudo

# Install dependencies
RUN apt-get install -y curl \
    && apt-get install -y iproute2 \
    && apt-get install -y openvpn \
    && apt-get install -y net-tools

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs

# Download the NordVPN install script
RUN curl -s https://repo.nordvpn.com/deb/nordvpn/debian/pool/main/nordvpn-release_1.0.0_all.deb > nordvpn-release_1.0.0_all.deb \
    && dpkg -i nordvpn-release_1.0.0_all.deb \
    || apt-get install -fy \
    && apt-get update \
    && apt-get install -y nordvpn

# Add a script that will be our entrypoint
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

#Install web server
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/entrypoint.sh"]
