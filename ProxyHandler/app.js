const express = require('express');
const { connectToVPN, getContainer } = require('./src/vpnManager');
const { retrieveIP, forwardRequest } = require('./src/serverHandler');

const MAX_RETRIES = 3;

const app = express();
app.use(express.json());

const servers = [
  { name: 'vpn1', ip: "" },
  { name: 'vpn2', ip: "" }
];
var index = 0;

app.post('/', async (req, res) => {
  try {
    if (servers[index].ip === "") {
      servers[index].ip = await retrieveIP(servers[index].name);
    }

    const resp = await forwardRequest(servers[index], req.body, req.query.url);

    res.setHeader('vpn-container', servers[index].name);
    res.setHeader('vpn-ip', servers[index].ip);
    res.status(resp.status).set(resp.headers).send(resp.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).set(error.response.headers).send(error.response.data);
    }
    res.status(500).send({
      service: 'handler',
      error: error.message,
    });
  }
});

app.post('/recreate', async (req, res) => {
  try {
    const container = await getContainer(servers[index].name);
    servers[index].ip = "";

    // Toggle the index between the 2 vpn container
    index = (index + 1) % 2;

    let retries = 0;
    let success = false;

    while (retries < MAX_RETRIES && !success) {
      try {
        await connectToVPN(container);
        success = true;
      } catch (err) {
        if (err.message.includes("NordVPN connection timed out.")) {
          retries++;
        } else {
          throw err;
        }
      }
    }

    if (!success) {
      throw new Error("Failed to connect to NordVPN after multiple retries.");
    }

    res.send('NordVPN connected successfully!');
  } catch (error) {
    res.status(500).send({
      service: 'handler',
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log('Web server is listening on port 3000');
});
