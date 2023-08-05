const express = require('express');
const Docker = require('dockerode');
const { default: axios } = require('axios');

const app = express();
app.use(express.json());
const docker = new Docker();

const servers = [
  'vpn1',
  'vpn2',
]
var index = 0;

app.post('/', async (req, res) => {

  try {
    const resp = await axios({
      method: 'POST',
      url: `http://${servers[index]}:3000?url=${req.query.url}`,
      data: req.body,
    })

    return res.send(resp.data);
  } catch (error) {
    res.send({
      service: 'handler',
      error: error.message,
    })
  }
});

app.post('/recreate', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true, filters: { name: [servers[index]] } });

    // Toggle the index between 0 and 1
    index = (index + 1) % 2;

    if (containers.length === 0) {
      return res.status(500).send('Container not found');
    }

    const container = docker.getContainer(containers[0].Id);
    const options = {
      AttachStdout: false,
      AttachStderr: false,
      Cmd: ['nordvpn', 'connect', process.env.CONNECT_OPTION]
    };

    const exec = await container.exec(options);
    await new Promise((resolve, reject) => {
      exec.start((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

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
