import { Service } from 'typedi';
import diskusage from 'diskusage';
import os from 'os';
import prettyBytes from 'pretty-bytes';

@Service()
export class SysInfo {
  ipAddr() {
    const nets = os.networkInterfaces();
    const results: Record<string, string[]> = {};

    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
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

  disk() {
    return new Promise<string>((resolve, reject) => {

      diskusage.check('/', function (err, info) {
        if (err) {
          reject(err);
        } else if (info === undefined) {
          return 'Disk usage info is missing';
        } else {
          resolve([
            `Disk space on /:`,
            `free ${prettyBytes(info.free)} of ${prettyBytes(info.total)}`
          ].join('\n'));
        }
      });
    });

  }

  memCpu() {
    return [
      `RAM: free ${prettyBytes(os.freemem())} of ${prettyBytes(os.totalmem())}`,
      `Load average: ${os.loadavg().map(v => v.toFixed(2)).join('; ')}`
    ].join('\n');
  }
}
