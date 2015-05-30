var exec = require('child_process').exec,
    path = require('path');


function develop(absFilePath, callback){ 
    if (absFilePath) {
        var dirname = path.dirname(absFilePath),
            extname = path.extname(absFilePath),
            basename = path.basename(absFilePath),
            basenameWithoutExt = path.basename(absFilePath, extname),
            srcDir = path.join(dirname, basenameWithoutExt);

        var unzipCmd = 'unzip -o ' + basename,
            copyFilesCmd = 'cp -r ' + basenameWithoutExt + '/*' + ' ./';

        exec(unzipCmd + ' && ' + copyFilesCmd, {
            cwd: dirname
        }, function(error, stdout, stderr){
            if ( !error ) {
                stdout += '\n' + copyFilesCmd;
            }
            callback && callback(error, stdout, stderr);
        });

    } else {
        callback && callback('error');
    }
}

// develop('/home/fiture/workspace/code/simple-file-uploader/uploads/fe-m-wallet-20150530T0647.zip', function(error, stdout, stderr){
//     console.log(stdout);
// });

module.exports = develop;
