function respondWithHTTPCode(response, code) {
	response.writeHead(code, {'Content-Type': 'text/plain'});
	response.end('Error 404');
}

function route(handle, pathname, response, postData, query) {

	var extension = pathname.split('.').pop();

	if ('function' === typeof handle[pathname]) {
		handle[pathname](response, postData, query);
	} else if ('css' === extension || 'js' === extension || 'html' === extension) {
		handle._static(response, pathname, postData);
	} else {
		respondWithHTTPCode(response, 404);
	}
}

exports.route = route;