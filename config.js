var config = {
    port: 8000,
    base_dir: '/home/fiture/workspace/simple-file-uploader/uploads'
};

exports.port = config.port;
exports.upload_dir = config.base_dir || './uploads';

exports.s3 = {
	key: '',
	secret: '',
	bucket: ''
};

exports.s3_enabled = false;
