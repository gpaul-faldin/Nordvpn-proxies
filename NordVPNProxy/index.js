const { default: axios } = require('axios')
const express = require('express')

const app = express()
app.use(express.json());

app.use('/', async (req, res) => {

  const url = req.query.url
  const body = req.body

  if (!url) {
    return res.send('url is required')
  }
  try {

    let resp = await axios({
      method: body.method,
      url: url,
      data: body.data ? body.data : null,
    })

    res.send(resp.data)
  } catch (error) {
    res.send({
      service: 'proxy',
      error: error.message,
    })
  }

})

app.listen(3000, () => { console.log('Node.js server is listening on port 3000') })