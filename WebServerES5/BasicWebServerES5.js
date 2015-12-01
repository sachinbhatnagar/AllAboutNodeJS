'use strict';
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var Q = require('q');

function fileAccess(filepath) {
	var deferred = Q.defer();
	fs.access(filepath, fs.F_OK && fs.R_OK, function(error) {
		if(!error) {
			deferred.resolve(filepath);
		} else {
			deferred.reject(error);
		}
	});

	return deferred.promise;
}

function streamFile(filepath) {
	var deferred = Q.defer();
	var streamFile = fs.createReadStream(filepath);

	streamFile.on('open', function() {
		deferred.resolve(streamFile);
	});

	streamFile.on('error', function(error) {
		deferred.reject(error);
	});
	
	return deferred.promise;
}


function errorHandler(error) {
	console.log("Error: ", error);
	res.writeHead(500);
	res.end(JSON.stringify(error));
}

http.createServer(function(req, res) {
	var baseURI = url.parse(req.url);
	var filepath = __dirname + (baseURI.pathname === '/' ? '/index.htm' : baseURI.pathname);
	var mimes = {
			".htm": "text/html",
			".html": "text/html",
			".css": "text/css",
			".js": "text/javascript",
			".gif": "image/gif",
			".jpg": "image/jpeg",
			".png": "image/png"
	}
	var contentType = mimes[path.extname(filepath)];
	
	fileAccess(filepath)
		.then(streamFile)
		.then(function(streamFile) {
			res.writeHead(200, {'Content-type': contentType});
			streamFile.pipe(res);
		})
		.catch(errorHandler);


}).listen(3000);