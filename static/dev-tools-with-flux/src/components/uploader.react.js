var React = require('react'),
    File = require('./file.react'),
    PostAjax = require('../lib/post'),
    AppActions = require('../actions/app-actions');

var Uploader = React.createClass({    

    /**
     *  获取当前文件的列表
     *  @return {array} files
     */
    getFiles: function(){
        return this.props.files;
    },

    /**
     *  判断当前是否可以上传文件
     *  @param {array} files
     *  @return {boolen} true|false
     */
    isReadyToUpload: function(files){
        files = files || this.getFiles();

        return ( 
            files.length                   //队列有文件
            && !this.onUploading           //队列没有正在上传的文件
            && this.fileIdx < files.length //队列文件没有上传完毕
        )
    },

    /**
     *  初始化上传
     */
    startUpload: function(){
        var files = this.getFiles(),
            fileReader = new FileReader(),
            curFile = files[this.fileIdx];

        if ( this.isReadyToUpload(files) ) {            
            fileReader.onload = (function(e){
                var data = JSON.stringify(e.target.result);

                this.doUpload({                    
                    contents: data,
                    name: curFile.name,
                    type: curFile.type
                }, curFile);
            }).bind(this);

            fileReader.readAsDataURL(curFile);
        }
    },

    /**
     *  上传文件
     *  @param {object} fileData 相关上传参数
     *  @param {object} file 将要被上传的文件对象
     */
    doUpload: function(fileData, file){
        var me = this;

        me.onUploading = true;
        file.status = 'uploading';
        fileData.uploadDir = me.props.currentDir; //获取上传路径
        AppActions.updateFileByIdx(me.fileIdx, file); //更新上传状态

        PostAjax({
            url: '/upload',
            data: JSON.stringify(fileData),
            success: me.onFileUploaded.bind(this, file),
            progress: function(e){
                var tmp = Math.round(e.loaded / e.total * 100);
                tmp = (tmp == 100) ? 99 : tmp;
                file.uploaded = tmp;             
                AppActions.updateFileByIdx(me.fileIdx, file);
            }
        });
    },

    /**
     *  文件上传成功回调
     *  @param {object} file 
     */
    onFileUploaded: function(file){
        file.uploaded = 100;
        file.status = 'uploaded';

        AppActions.fileUploaded(file);
        AppActions.updateFileByIdx(this.fileIdx, file);

        this.onUploading = false;
        this.fileIdx += 1;

        if ( this.isReadyToUpload() ) {
            //console.log('继续上传', this.fileIdx);
            this.startUpload();
        } else {
            //console.log('队列文件上传完毕');
        }
    },

    /**
     *  监听拖拽文件进入事件
     *  @param {object} event object  
     */
    handleDrop: function(e) {
        this.noop(e);
        var fileList = e.dataTransfer.files,
            len = fileList.length,
            filesArr = [];

        for (var i = 0; i<len; i++) {
            filesArr.push( fileList.item(i) );
        }
        AppActions.addFiles(filesArr);
    },

    componentDidMount: function(){
        this.fileIdx = 0;
        this.onUploading = false;
    },

    componentDidUpdate: function(){
        this.isReadyToUpload() && this.startUpload();
    },

    noop: function(e){
        e.preventDefault();
        e.stopPropagation();
    },

    /**
     *  生成组件列表
     *  @return {object} react compontents list  
     */
    renderFileList: function(){
        var fileList = [],
            files = this.getFiles(),
            count = files.length;

        for ( var i = 0; i<count; i++) {
            var file = files[i];
            fileList.push(
                <File 
                key={i}
                name={file.name} 
                size={file.size} 
                status={file.status}
                uploaded={file.uploaded}/>
            )
        }

        return fileList;
    },

    render: function() {
        var fileList = this.renderFileList();

        return (
            <div className="drag-area"
                onDrop={this.handleDrop}
                onDragEnter={this.noop}
                onDragExit={this.noop} 
                onDragOver={this.noop}
            > 
                {
                    fileList.length ? 
                    <ul className="file-list">{fileList}</ul> :
                    <span className="upload-tip">Drop the files here...</span>
                }
            </div>
        );
    }
});

module.exports = Uploader;