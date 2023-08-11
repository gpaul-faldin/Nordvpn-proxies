const axios = require('axios');

// Helper function to check if a server is in a given group
function isInGroup(server, groupIdentifier) {
  return server.groups.some(group => group.identifier === groupIdentifier);
}

const hasWireguard = (server) => {
  return server.technologies.some(tech => tech.name === 'Wireguard');
};

function getRandomServer(servers) {
  const randomIndex = Math.floor(Math.random() * servers.length);
  return servers[randomIndex];
}

// The function to filter servers by group and load
const serverPicker = async (group, minLoad, maxLoad) => {

  try {
    const response = await axios.get('https://api.nordvpn.com/v1/servers?limit=50000');
    const servers = response.data.filter(server =>
      isInGroup(server, group) &&
      server.load >= Number(minLoad) &&
      server.load <= Number(maxLoad) &&
      hasWireguard(server)
    );

    // Store the server details (hostname and IP) for the filtered servers
    const serverDetails = servers.map(server => ({
      hostname: server.hostname,
      ip: server.station,
      load: server.load
    }));

    const eligibleServers = serverDetails.filter(server => !server.hostname.startsWith('socks-'));
    const randomServer = await getRandomServer(eligibleServers);

    return {
      host: randomServer.hostname.split('.')[0],
      ip: randomServer.ip,
      load: randomServer.load
    };

  } catch (error) {
    console.error('Error fetching servers:', error);
  }
}

exports.serverPicker = serverPicker;