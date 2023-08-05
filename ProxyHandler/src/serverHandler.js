const axios = require('axios');

exports.retrieveIP = async (serverName) => {
  const resp = await axios({
    method: 'GET',
    url: `http://${serverName}:3000/fetch-ip`,
  });
  return resp.data;
};

exports.forwardRequest = async (server, reqBody, reqUrl) => {
  const resp = await axios({
    method: 'POST',
    url: `http://${server.name}:3000?url=${reqUrl}`,
    data: reqBody,
  });
  return resp;
};
