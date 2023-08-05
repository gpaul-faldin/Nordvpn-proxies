# Nordvpn-Proxies 🌐

**Nordvpn-Proxies** is an integrated solution for creating rotating proxies leveraging a Nordvpn account.

## 📋 Prerequisites

- You'll need your **Nordvpn key**:
  - Set it as an environment variable
  - Alternatively, define it directly inside the `start.sh` file (line 44).
  
- Set the **CONNECT_OPTION** environment variable:
  - This acts as the argument to the `nordvpn connect` function.
  - Alternatively, define it directly inside the `start.sh` file (line 45).

## 🚀 Getting Started

For a quick setup, simply run:
```bash
bash start.sh
```

### Manual Setup:

1. **Build Docker Images:** Utilize the included script to construct the Docker images for the project:
    ```bash
    ./build_images.sh
    ```

2. **Fire up the Services:** Once the images are ready, you can initiate all services:
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
    // Additional data for POST/PUT methods if needed
  }
}
```
💡 Use this endpoint to proxy the chosen HTTP method to the desired URL.

### 2. Recreate Endpoint

- **Endpoint:** `http://localhost:3000/recreate`
- **Method:** `POST`

💡 Rotate your current proxy and switch the connection using this endpoint. No request body is necessary.
