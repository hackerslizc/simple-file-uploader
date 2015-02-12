var config = require('./config'),
    http = require('http'),
    url = require('url');

function start(route, handle) {

	function onRequest(request, response) {

		var pathname = url.parse(request.url).pathname,
			query = (url.parse(request.url, true)).query,
			postData = '';

		request.setEncoding('utf8');

		request.addListener('data', function (postDataChunk) {
			postData += postDataChunk;
		});

		request.addListener('end', function () {
			route(handle, pathname, response, postData, query);
		});
	}

	http.createServer(onRequest).listen(config.port);
}

exports.start = start;