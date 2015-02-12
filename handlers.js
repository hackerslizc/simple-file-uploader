var config = require('./config'),
    path = require('path'),
    fs = require('fs');

function home(response, postData) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('./static/index.html'));
}

function getDir(response, postData, query){
    var res = {},
        resFiles = [],
        queryDir = query.uploadDir,
        configDir = config.upload_dir,
        isDirAvailable = checkDir(queryDir),
        uploadDir;

    uploadDir = isDirAvailable ? queryDir : configDir;

    fs.readdir(uploadDir, function(err, files){
        if ( err ) {
            res.err = true;
        } else {
            files.filter(function(file){
                var isDirectory = fs.statSync(path.join(uploadDir, file)).isDirectory(),
                    notDotFile = (file.indexOf('.') !== 0);

                return isDirectory && notDotFile;
            }).forEach(function(file){
                resFiles.push(file);
            });

            res.files = resFiles;
            res.currentDir = uploadDir;
        }

        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(res));
    });
}

function checkDir (dir) {
    //如果请求查询的路径(queryDir)存在 并且 请求查询的路径是配置路径（configDir）的子目录
    return ( dir && dir.indexOf(config.upload_dir) == 0);
}

function upload(response, postData) {
    
    var file                 = JSON.parse(postData),
        isDirAvailable       = checkDir(file.uploadDir),
        filePathBase         = isDirAvailable ? file.uploadDir : config.upload_dir,
        filePath             = path.join(filePathBase, file.name),
    
        fileExtension        = path.extname(file.name),
        fileRootName         = path.basename(file.name, fileExtension),
        fileRootNameWithBase = path.join(filePathBase, fileRootName),

        fileID               = 2,
        fileBuffer;

    if ( !config.overideFile ) {
        while (fs.existsSync(filePath)) {
            filePath = fileRootNameWithBase + '(' + fileID + ')'+fileExtension;
            fileID += 1;
        }
    }
    
    file.contents = file.contents.split(',').pop();
    
    fileBuffer = new Buffer(file.contents, "base64");
    
    if (config.s3_enabled) {

        var knox = require('knox'),
            client = knox.createClient(config.s3),
            headers = {'Content-Type': file.type};
        
        client.putBuffer(fileBuffer, fileRootName, headers, function (err, res) {
            
            if (typeof res !== "undefined" && 200 === res.statusCode) {
                console.log('Uploaded to: %s', res.client._httpMessage.url);
                response.statusCode = 200;
            } else {
                console.log('Upload failed!');
                response.statusCode = 500;
            }
            
            response.end();
        });
        
    } else {
        fs.writeFileSync(filePath, fileBuffer);
        response.statusCode = 200;
        response.end();
        console.log('Uploaded: ', filePath);
    }
}

function serveStatic(response, pathname, postData) {

    var extension = pathname.split('.').pop(),
        extensionTypes = {
            'css' : 'text/css',
            'gif' : 'image/gif',
            'jpg' : 'image/jpeg',
            'jpeg': 'image/jpeg',
            'js'  : 'application/javascript',
            'png' : 'image/png'
        };
    
    response.writeHead(200, {'Content-Type': extensionTypes[extension]});
    response.end(fs.readFileSync('./static' + pathname));
}

exports.home = home;
exports.upload = upload;
exports.getDir = getDir;
exports.serveStatic = serveStatic;