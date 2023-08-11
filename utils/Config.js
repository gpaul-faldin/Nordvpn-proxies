const fs = require('fs');

function updateProxyHandlerIndex(vpnCount, vpnOptions) {
  const serverList = [];

  // Parse vpnOptions
  const optionsMap = vpnOptions.split(' ').reduce((acc, item) => {
    const [name, option] = item.split(':');
    acc[name] = option;
    return acc;
  }, {});

  for (let i = 1; i <= vpnCount; i++) {
    const option = optionsMap[`vpn${i}`] || "";
    serverList.push(`  { name: 'vpn${i}', ip: "", option: "${option}", ready: true, pastIps: [] }`);
  }

  const servers = serverList.join(',\n');
  const content = fs.readFileSync('./ProxyHandler/app.js', 'utf8');
  const newContent = content.replace(/const servers = \[\n(.*\n)*\];/, `const servers = [\n${servers}\n];`);
  fs.writeFileSync('./ProxyHandler/app.js', newContent);
}

const vpnCount = parseInt(process.argv[2] || '2', 10);
const vpnOptions = process.argv[3] || "";

if (isNaN(vpnCount) || vpnCount < 1) {
  console.error('Please provide a valid number of VPNs.');
  process.exit(1);
}

updateProxyHandlerIndex(vpnCount, vpnOptions);
console.log('proxyHandler index.js updated.');
