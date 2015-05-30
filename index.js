var server = require('./server'),
    handlers = require('./handlers'),
    router = require('./router'),
    handle = {};

handle['/'] = handlers.home;
handle['/dev.html'] = handlers.dev;
handle['/develop.html'] = handlers.develop;
handle['/home'] = handlers.home;
handle['/upload'] = handlers.upload;
handle['/get-dir'] = handlers.getDir;
handle['/del'] = handlers.del;
handle._static = handlers.serveStatic;

server.start(router.route, handle);