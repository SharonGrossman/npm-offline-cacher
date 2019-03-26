export const config =  {
  storage: '.tmp/storage',
  web: 'enable:true',
  uplinks: {
    npmjs: {url: 'https://registry.npmjs.org/'}
  },
  packages: {
    '@*/*': {access: '$all', proxy: 'npmjs'},
    '*': {access: '$all', proxy: 'npmjs'}
  },
  self_path: '.tmp',
  listen: 'http://localhost:4873/'
};