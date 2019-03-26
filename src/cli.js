import program, {LIST} from 'caporal';
import updateNotifier from 'update-notifier';
import pkg from '../package.json';
import {start} from '.';

const notifier = updateNotifier({pkg});

program.version(pkg.version)
  .description(pkg.description)
  .command('install', 'Install the packages')
  .alias('i')
  .argument('[packages]', 'The packages to install', LIST)
  .action(({packages}) => {
    start({packages});

    notifier.notify();
  });

export default argv => {
  program
    .parse(argv);
};