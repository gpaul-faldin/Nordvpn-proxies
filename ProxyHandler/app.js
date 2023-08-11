const express = require('express');
const { connectToVPN, getContainer } = require('./src/vpnManager');
const { retrieveIP, forwardRequest } = require('./src/serverHandler');
const { serverPicker } = require('./src/serverPicker');
const {sleep} = require('./src/utils');

const MAX_RETRIES = 3;

const app = express();
app.use(express.json());

const servers = [
  { name: 'vpn1', ip: "", option: "europe", ready: true, pastIps: [] },
  { name: 'vpn2', ip: "", option: "the_americas", ready: true, pastIps: [] }
];
var index = 0;

app.post('/', async (req, res) => {
  res.setHeader('vpn-container', servers[index].name);

  if (!servers[index].ready) {
    return res.status(503).send({
      service: 'handler',
      error: `${servers[index].name} server not ready`,
    });
  }
  try {
    if (servers[index].ip === "") {
      servers[index].ip = await retrieveIP(servers[index].name);
      servers[index].pastIps.push(servers[index].ip);
    }

    const resp = await forwardRequest(servers[index], req.body, req.query.url);

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
  const prevIndex = index;
  index = (index + 1) % servers.length;
  res.setHeader('vpn-container', servers[prevIndex].name);

  servers[prevIndex].ready = false;
  try {
    const container = await getContainer(servers[prevIndex].name);
    servers[prevIndex].ip = "";

    let retries = 0;
    let success = false;
    let attemptedServerName = "Unknown Server";
    let server = null;

    while (retries < MAX_RETRIES && !success) {
      if (servers[prevIndex].pastIps.length === 5) {
        servers[prevIndex].pastIps.shift();
      }
      while (server == null) {
        server = await serverPicker(servers[prevIndex].option, 35, 75);
        if (servers[prevIndex].pastIps.includes(server.ip))
          server = null;
      }
      servers[prevIndex].pastIps.push(server.ip);
      console.log(server);
      attemptedServerName = server.host;
      try {
        attemptedServerName = await connectToVPN(container, server.host, retries);
        success = true;
      } catch (err) {
        if (err.message.includes("Whoops!")) {
          server = null;
          retries++;
          console.log(`Failed to connect to ${attemptedServerName}. Retrying in 60 seconds...`)
          await sleep(60000);
        } else {
          throw {
            message: err.message,
            server: err.server || attemptedServerName
          };
        }
      }
    }

    if (!success) {
      throw new Error(`Failed to connect to NordVPN after multiple retries. Last attempted server: ${attemptedServerName}`);
    }
    servers[prevIndex].ip = server.ip;
    servers[prevIndex].ready = true;
    res.setHeader('vpn-ip', servers[prevIndex].ip);

    res.send(`NordVPN connected successfully to ${attemptedServerName}!`);
  } catch (error) {
    index = prevIndex;
    res.status(500).send({
      service: 'handler',
      error: error.message.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim(),
      attemptedServer: error.server
    });
  }
});

app.get('/status', async (req, res) => {
  res.send(servers);
});

app.listen(3000, () => {
  console.log('Web server is listening on port 3000');
});
