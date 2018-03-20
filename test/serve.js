const server = require('../src/server');

const port = 3000;
const staticPort = 3001;

server({
    port
});

const open = require('opener');

open(`http://127.0.0.1:${staticPort}/index.html`);