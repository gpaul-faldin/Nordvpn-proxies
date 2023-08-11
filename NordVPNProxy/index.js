const { default: axios } = require('axios')
const express = require('express')

const app = express()
app.use(express.json());

app.post('/', async (req, res) => {

  const url = req.query.url;
  const body = req.body;

  if (!url) {
    return res.status(400).send('url is required');
  }
  if (!body.method) {
    return res.status(400).send('method is required');
  }

  try {
    let resp = await axios({
      method: body.method,
      url: url,
      data: body.data ? body.data : null,
    });

    res.status(resp.status).set(resp.headers).send(resp.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).set(error.response.headers).send(error.response.data);
    }
    res.status(500).send({
      service: 'proxy',
      error: error.message,
    });
  }
});

app.get('/fetch-ip', async (req, res) => {
  try {
    const resp = await axios({
      method: 'GET',
      url: 'https://ipinfo.io/ip',
    })
    return res.send(resp.data);
  } catch (error) {
    return res.send('')
  }
});


app.listen(3000, () => { console.log('Node.js server is listening on port 3000') })