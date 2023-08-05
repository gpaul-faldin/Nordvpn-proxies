const Docker = require('dockerode');
const docker = new Docker();

const CONNECT_TIMEOUT = 10000;
const DEFAULT_CONNECT_OPTION = process.env.CONNECT_OPTION || "";

exports.getContainer = async (serverName) => {
  const containers = await docker.listContainers({
    all: true,
    filters: { name: [serverName] }
  });

  if (containers.length === 0) {
    throw new Error("Container not found");
  }

  return docker.getContainer(containers[0].Id);
};

exports.connectToVPN = async (container) => {
  return new Promise(async (resolve, reject) => {
    const options = {
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: ['nordvpn', 'connect', DEFAULT_CONNECT_OPTION]
    };

    const exec = await container.exec(options);

    exec.start({ hijack: true, stdin: false, stdout: true, stderr: true }, (err, stream) => {
      if (err) {
        return reject(err);
      }

      let output = '';
      stream.on('data', (chunk) => {
        output += chunk.toString('utf-8');
      });

      stream.on('end', () => {
        if (output.includes("You are connected to")) {
          resolve();
        } else {
          reject(new Error(`NordVPN connection failed with output: ${output}`));
        }
      });

      setTimeout(() => {
        stream.destroy();
        reject(new Error("NordVPN connection timed out."));
      }, CONNECT_TIMEOUT);
    });
  });
};
