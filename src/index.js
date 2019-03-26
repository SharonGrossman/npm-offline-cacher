import path from 'path';
import npm from 'npm';
import pify from 'pify';
import {remove, copy, ensureDir, readdir} from 'fs-extra';
import _ from 'lodash';
import startServer from 'verdaccio';
import {config} from './verdaccio.config';

let packagesToInstall = [];
let packagesInstalled = [];
let server;

const paths = {
  temp: '.tmp',
  storage: '.tmp/storage',
  export: 'export/storage'
};

const installPackages = pkgs =>
  pify(npm.commands.install.bind(npm.commands))(paths.temp, pkgs)
    .then(() => {
      packagesInstalled = packagesInstalled.concat(packagesToInstall);

      return readdir(paths.storage);
    })
    .then(files => {
      files = files.filter(file => !file.startsWith('.'));
      packagesToInstall = _.difference(files, packagesInstalled);

      return packagesToInstall;
    })
    .then(downloadPackages);

const downloadPackages = () => {
  if (!packagesToInstall.length) {
    console.log('All done!');

    return Promise.resolve();
  }

  return installPackages(packagesToInstall);
};

export const start = ({packages}) => {
  packagesToInstall = packages.split(',');

  return remove(path.resolve(process.env.APPDATA, 'npm-cache'))
    .then(() => remove(paths.temp))
    .then(() => ensureDir(paths.storage))
    .then(() => new Promise(resolve => {
      startServer(config, 4873, null, 'verdaccio', '1.0.0',
        (webServer, addrs) => {
          server = webServer;
          webServer.listen(addrs.port || addrs.path, addrs.host, () => {
            console.log('verdaccio running');
            resolve();
          });
        });
    }))
    .then(() => pify(npm.load.bind(npm))({registry: 'http://localhost:4873/'}))
    .then(() => {
      npm.on('log', message => console.log(message));
    })
    .then(downloadPackages)
    .then(() => {
      if (server) {
        server.close();
        server = null;
      }
    })
    .then(() => ensureDir(paths.export))
    .then(() => copy(paths.storage, paths.export))
    .then(() => remove(paths.temp))
    .catch(() => err => console.log(err));
};