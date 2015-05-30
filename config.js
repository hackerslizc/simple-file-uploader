var config = {
    port: 8000,
    overideFile: true,
    base_dir: ''//'/home/fiture/workspace/code/simple-file-uploader/uploads'
};

exports.port = config.port;
exports.overideFile = config.overideFile;
exports.upload_dir = config.base_dir || './uploads';

exports.s3 = {
	key: '',
	secret: '',
	bucket: ''
};

exports.s3_enabled = false;
