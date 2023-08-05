#!/bin/bash
# Start the NordVPN daemon
service nordvpn start
sleep 10

# Login to your NordVPN account
nordvpn login --token $NORDVPN_TOKEN

# Allow port 3000 to communicate with webserv
nordvpn whitelist add port 3000

# Connect to a NordVPN server
nordvpn connect

# Start your Express server
node index.js &

# Keep the script running
tail -f /dev/null
