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

app.get('/health', async (req, res) => {
  console.log("TEST")
  try {
    const resp = await axios({
      method: 'POST',
      url: `http://${servers[index]}:3000`,
    })
    return res.send(resp.data);
  } catch (error) {
    res.send({
      service: 'handler',
      error: error.message,
    })
  }
})

app.post('/', async (req, res) => {

  console.log("Request received")

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

    if (containers.length > 0) {
      const existingContainer = docker.getContainer(containers[0].Id);
      await existingContainer.stop();
      await existingContainer.remove();
    }

    const newContainer = await docker.createContainer({
      name: servers[index],
      Image: 'nordvpn',
      HostConfig: {
        CapAdd: ['NET_ADMIN'],
        NetworkMode: 'proxy-network'
      },
      Env: [`NORDVPN_TOKEN=${process.env.NORDVPN_TOKEN}`],
    });


    await newContainer.start();

    // Toggle the index between 0 and 1
    index = (index + 1) % 2;

    res.send('Container recreated successfully!');
  } catch (error) {
    console.error('Error recreating container:', error.message);
    res.status(500).send('Error recreating container');
  }
});


app.listen(3000, () => {
  console.log('Web server is listening on port 3000');
});
