var config = require('./config'),
    path = require('path'),
    querystring = require('querystring'),
    fs = require('fs');

function home(response, postData) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('./static/index.html'));
}

function dev(response, postData) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('./static/dev.html'));
}

function getDir(response, postData, query){
    var res = {},
        resFiles = [],
        queryDir = query.uploadDir,
        configDir = config.upload_dir,
        isDirAvailable = checkDir(queryDir),
        uploadDir;

    uploadDir = isDirAvailable ? queryDir : path.join(__dirname, configDir);

    fs.readdir(uploadDir, function(err, files){
        if ( err ) {
            res.err = true;
            res.uploadDir = uploadDir;

            //console.log(__filename, __dirname)
        } else {
            /*
            files.filter(function(file){
                var isDirectory = fs.statSync(path.join(uploadDir, file)).isDirectory(),
                    notDotFile = (file.indexOf('.') !== 0);

                return isDirectory && notDotFile;
            })
            */
            files.forEach(function(file){
                var isDirectory = fs.statSync(path.join(uploadDir, file)).isDirectory();

                resFiles.push({isDir: isDirectory, name: file});
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
    return ( dir && dir.indexOf(path.join(__dirname,config.upload_dir)) == 0);
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


function del(response, postData, query){
    //var rimraf = require('rimraf');

    postData = querystring.parse(postData);

    var tarDir = postData.target || path.join(__dirname, config.upload_dir),
        isDirAvailable = checkDir(tarDir);

    fs.exists(tarDir, function(isExist){
        console.log(isExist, isDirAvailable);
        if ( isExist && isDirAvailable ) {            
            fs.unlink(tarDir, function(r){
                console.log((new Date).toJSON() + ' 删除了文件：', tarDir);
                resJSON(response, {status: 1, data: {}, msg: ''});
            });
        } else {
            resJSON(response, {status:0, data:{tarDir: tarDir}, msg: 'file not exits or not available'});
        }
    });
}

function resJSON(res, data){
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}


exports.del = del;
exports.dev = dev;
exports.home = home;
exports.upload = upload;
exports.getDir = getDir;
exports.serveStatic = serveStatic;