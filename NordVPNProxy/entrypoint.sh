#!/bin/bash
# Start the NordVPN daemon
service nordvpn start
sleep 10

# Login to your NordVPN account
nordvpn login --token $NORDVPN_TOKEN

# Allow port 3000 to communicate with webserv
nordvpn whitelist add port 3000

# Connect to a NordVPN server
while true; do
    nordvpn connect $CONNECT_OPTION
    CONNECTION_STATUS=$(nordvpn status | grep -i "Status:")

    if [[ $CONNECTION_STATUS == *"Connected"* ]]; then
        echo "Successfully connected!"
        break
    else
        echo "Failed to connect, retrying in 60 seconds..."
        sleep 60
    fi
done

# Start your Express server
node index.js &

# Keep the script running
tail -f /dev/null
