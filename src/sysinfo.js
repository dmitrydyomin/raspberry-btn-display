const diskusage = require('diskusage');
const os = require('os');
const prettyBytes = require('pretty-bytes');

const ipAddr = () => {
  const nets = os.networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  if (Object.keys(results).length === 0) {
    return 'No IP addresses';
  }

  return Object.keys(results).map(i => `${i}: ${results[i].join('; ')}`).join('\n');
}

const disk = (callback) => {
  diskusage.check('/', function (err, info) {
    if (err) {
      callback(err);
    } else {
      callback(null, [
        `Disk space on /:`,
        `free ${prettyBytes(info.free)} of ${prettyBytes(info.total)}`
      ].join('\n'));
    }
  });

}

const memCpu = () => {
  return [
    `RAM: free ${prettyBytes(os.freemem())} of ${prettyBytes(os.totalmem())}`,
    `Load average: ${os.loadavg().map(v => v.toFixed(2)).join('; ')}`
  ].join('\n');
}

module.exports = {
  disk,
  ipAddr,
  memCpu,
};
