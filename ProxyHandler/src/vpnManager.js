const Docker = require('dockerode');
const docker = new Docker();

const CONNECT_TIMEOUT = 40000;

async function runCommand(container, cmd, expectedOutput, timeout = CONNECT_TIMEOUT) {
  return new Promise(async (resolve, reject) => {
    const options = {
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: cmd
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
        const isOutputExpected = expectedOutput.some(eo => output.includes(eo));

        if (isOutputExpected) {
          const serverMatch = output.match(/Connecting to (.+?) \(/);
          const serverName = serverMatch ? serverMatch[1] : "Unknown Server";
          resolve(serverName);
        } else {
          reject({
            message: `Command failed with output: ${output}`,
            server: "Unknown Server"
          });
        }
      });

      setTimeout(() => {
        stream.destroy();
        reject(new Error(`Command timed out after ${timeout}ms. Output: ${output}`));
      }, timeout);
    });
  });
}

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

exports.connectToVPN = async (container, server, retries) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (retries === 0) {
        // Step 1: Disconnect from NordVPN
        console.log("Attempting to disconnect from NordVPN...");
        await runCommand(container, ['nordvpn', 'disconnect'], ["You are disconnected from NordVPN.", "You are not connected to NordVPN."]);
        console.log("Successfully disconnected from NordVPN.");

        // Step 2: Check NordVPN status
        console.log("Checking NordVPN status...");
        await runCommand(container, ['nordvpn', 'status'], ["Status: Disconnected"], 2000); // 2s timeout
        console.log("NordVPN status: Disconnected");
      }
      // Step 3: Connect to NordVPN
      console.log(`Attempting to connect to server: ${server}...`);
      const serverName = await runCommand(container, ['nordvpn', 'connect', server], ["You are connected to"]);
      console.log(`Successfully connected to ${serverName}.`);
      resolve(serverName);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      reject(err);
    }
  });
};
