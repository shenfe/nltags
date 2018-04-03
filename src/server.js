const fs = require('fs');
const path = require('path');
const http = require('http');

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const serve = require('koa-static');
const gracefulShutdown = require('http-graceful-shutdown');

const defaults = require('./config');

const { ensureDir } = require('./util');

module.exports = function main(options = {}) {
    const conf = {
        ...defaults,
        ...options
    };
    const app = new Koa();
    const router = new Router();

    let dbPath = conf.dbPath;
    if (!dbPath.startsWith('http://') && !dbPath.startsWith('https://')) {
        dbPath = path.resolve(process.cwd(), dbPath);
        ensureDir(dbPath);
    }
    const db = require('./dao');
    db.open(dbPath, {
        type: 'pos'
    });

    app.keys = ['some secret for tagger server'];

    router.get(`/get`, async function (ctx, next) {
        console.log('request query', ctx.request.query);
        ctx.response.header['Access-Control-Allow-Origin'] = ctx.request.origin;
        ctx.response.header['Content-Type'] = 'application/json; charset=utf-8';
        // console.log('response header', ctx.response.header);
        ctx.status = 200;
        ctx.body = await db.get(ctx.request.query);
        await next();
    });

    router.post(`/put`, async function (ctx, next) {
        console.log('request body', ctx.request.body);
        ctx.response.header['Access-Control-Allow-Origin'] = ctx.request.origin;
        ctx.response.header['Content-Type'] = 'application/json; charset=utf-8';
        // console.log('response header', ctx.response.header);
        ctx.status = 200;
        ctx.body = await db.put(ctx.request.body);
        await next();
    });

    app
        .use(cors({
            // origin: '*',
            credentials: true
        }))
        .use(serve(path.resolve(__dirname, 'static')))
        .use(serve(path.resolve(__dirname, '../dist')))
        .use(bodyParser())
        .use(router.routes())
        .use(router.allowedMethods())
    ;

    const server = http.createServer(app.callback());

    gracefulShutdown(server, {
        onShutdown: () => {
            console.log('Closing...');
        }
    });

    server.listen(conf.port, function () {
        console.log(`Server started on ${conf.port} port`);
    });

    return {
        koaApp: app,
        server
    };
};
