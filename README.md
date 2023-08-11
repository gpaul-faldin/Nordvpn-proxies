# Nordvpn-Proxies 🌐

Empower your development with **Nordvpn-Proxies**, an integrated solution for crafting rotating proxies using a / multiple Nordvpn account(s).

### 🚧 Disclaimer

🔍 Note: This project is still under active development. As it evolves, changes are expected. Please keep this in mind when integrating or deploying in production environments.

### About

Designed with efficiency at its core, **Nordvpn-Proxies** abstracts the intricacies of proxy rotation, offering a streamlined API interface for directing web traffic and orchestrating connections. Be it enhancing web scraping capabilities, anonymizing data requests, or dispersing traffic for rigorous load testing, **Nordvpn-Proxies** stands as your comprehensive toolkit.

🛠 **Features:**
- **Rotating Proxies:** Transition smoothly between diverse Nordvpn connections.
- **Ensure different ip:** You will never get the same IP in a row.
- **Always UP:** A script is used to fetch only working vpn servers with a moderate load.
- **Intuitive API:** Propel your requests without entangling in proxy configurations.
- **Enhanced Feedback:** Additional response headers to gain insights on the proxy being used.
- **Tailorable:** Shape specific Nordvpn connection attributes in line with your requirements.

## 📋 Prerequisites

- **Configure your NordVPN Tokens**:
  - Set up a `vpn-config.json` file based on the provided `vpn-config.example.json`.
  - The file should look something like this:
    ```json
    [
      {
        "NORDVPN_TOKEN": "TOKEN1",
        "CONNECT_OPTION": "europe",
        "COUNT": 2
      },
      {
        "NORDVPN_TOKEN": "TOKEN2",
        "CONNECT_OPTION": "the_americas",
        "COUNT": 2
      },
      ...
    ]
    ```

## 🚀 Getting Started

For an effortless setup:
```bash
bash start.sh
```

Or, delve into a manual setup:

1. **Construct Docker Images:** Harness the bundled script to sculpt the Docker images for the initiative:
    ```bash
    ./build_images.sh
    ```

2. **Ignite the Services:** With the images sculpted, commence all services:
    ```bash
    docker-compose up
    ```

## 📡 API

### 1. Proxy Endpoint

- **Endpoint:** `http://localhost:3000/?url=<URL>`
- **Method:** `POST`
- **Body:**
```json
{
  "method": "<HTTP_METHOD>",
  "data": {
    // Append data for POST/PUT operations if imperative
  }
}
```
- **Response Headers**:
  - `vpn-container`: Name of the currently used VPN container.
  - `vpn-ip`: External IP of the latest VPN connection.

💡 Channel the specified HTTP method towards the target URL using this endpoint.

### 2. Recreate Endpoint

- **Endpoint:** `http://localhost:3000/recreate`
- **Method:** `POST`

- **Response Headers**:
  - `vpn-container`: Name of the rotated VPN container.
  - `vpn-ip`: External IP of the rotated VPN connection.

💡 Pivot to a fresh proxy and interchange the connection via this endpoint. No request body requisition.

### 3. VPN Server(s) Status

- **Endpoint:** `http://localhost:3000/status`
- **Method:** `GET`

**Example Response**:

```json
[
    {
        "name": "vpn1",
        "ip": "",
        "option": "europe",
        "ready": true,
        "pastIps": []
    },
    {
        "name": "vpn2",
        "ip": "",
        "option": "the_americas",
        "ready": true,
        "pastIps": []
    },
    ...
]
```
