Sure, here is a more detailed and organized version of your `README.md`:

---

# Nordvpn-Proxies

Nordvpn-Proxies is an all-in-one solution for creating rotating proxies using a Nordvpn account.

## Prerequisites

Before you get started, you will need to have your Nordvpn key. This key can be set as an environment variable, or it can be set manually inside the ProxyHandler

You also need to set you Nordvpn key inside the docker-compose.yml

## Getting Started

1. **Build Docker Images:** Use the provided script to build the Docker images for the project. Run this script from the root of the project directory:

    ```bash
    ./build_images.sh
    ```

2. **Start Services:** After the images have been built, start all services with the following command:

    ```bash
    docker-compose up
    ```

## API

The Nordvpn-Proxies API exposes two endpoints:

### Proxy Endpoint

**Endpoint:** `http://localhost:3000/?url=<url>`

**Method:** `GET/POST/PUT...`

**Body (for POST/PUT/... methods):**
```json
{
  "method": "<http method>",
  "data": {
    // Optional request body for POST/PUT methods
  }
}
```

**Description:** This endpoint proxies the specified HTTP method to the specified URL.

### Recreate Endpoint

**Endpoint:** `http://localhost:3000/recreate`

**Method:** `POST`

**Description:** This endpoint rotates the current proxy and switches the connection to the other one. No request body is required.
