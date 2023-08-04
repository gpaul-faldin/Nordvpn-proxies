# Nordvpn-proxies
A all in one solution to create rotating proxies with a nordvpn account

You must set your Nordvpn key as a ENV variable or set it inside the ProxyHandler and inside the docker-compose

How to run:
  Build the images using the script provided
  docker compose up

API:
  :3000/?url="url of your site"
    body: {
      method: "GET/POST/PUT/...",     # REQUIRED
      data: {}                        #OPTIONAL
    }

  :3000/recreate
    Rotate the current proxy and switch the connection to the other one