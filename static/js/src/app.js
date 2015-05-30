var Uploader = React.createClass({
    getInitialState: function() {
        return {
            files: []
        };
    },

    startUpload: function(){
        var files = this.state.files;
        if ( !files.length || this.fileIdx > files.length - 1) {
            return;
        }

        var reader = new FileReader();

        reader.onload = (function(e){
            var data = e.target.result;
            data = JSON.stringify(data);

            this.doUpload(data);

        }).bind(this);

        reader.readAsDataURL(files[ this.fileIdx ]);
    },

    doUpload: function(data){
        var me = this;

        var files = me.state.files;
        files[me.fileIdx].status = 'uploading';

        me.setState({
            files: files
        }, upload);


        function upload(){
            me.onUploading = true;

            var curFile = {
                contents: data,
                name: files[me.fileIdx].name,
                type: files[me.fileIdx].type
            }, xhr;

            xhr = $.ajax({
                type: 'POST',
                url: '/upload',
                data: JSON.stringify(curFile)
                ,
                xhr: function(){
                    var xhrObj = $.ajaxSettings.xhr();

                    xhrObj.upload.onprogress = function(e){
                        var tmp = Math.round(e.loaded / e.total * 100)
                        files[me.fileIdx].uploaded = tmp;

                        me.setState({
                            files: files
                        });

                    };

                    return xhrObj;      
                }
            });

            xhr.done(function(){
                files[me.fileIdx].status = 'uploaded';

                me.setState({
                    files: me.state.files
                }, function(){
                    me.fileIdx += 1;
                    if ( me.fileIdx <= me.state.files.length - 1 ) {
                        console.log('继续上传', me.fileIdx, me.onUploading);
                        me.startUpload();
                    } else {
                        me.onUploading = false;
                        console.log('队列文件上传完毕', me.onUploading);
                    }
                });
            });

            xhr.fail(function(){

            })
        }
    },

    handleDrop: function(e) {
        this.noop(e);

        var files = $.makeArray(e.dataTransfer.files);

        this.setState({
            files: this.state.files.concat(files)
        }, function(){
            //如果当前没有正在上传，则自动开始上传
            !this.onUploading && this.startUpload();
        });
    },

    componentDidMount: function(){
        this.fileIdx = 0;
        this.onUploading = false;
    },

    noop: function(e){
        e.preventDefault();
        e.stopPropagation();
    },

    render: function() {
        var fileList = [],
            files = this.state.files,
            count = files.length;

        if ( count ) {
            for ( var i = 0; i<count; i++) {
                fileList.push(
                    <File name={files[i].name} 
                          size={files[i].size} 
                          status={files[i].status}
                          uploaded={files[i].uploaded} />
                )
            }
        }

            console.log('render')

        return (


            <div className="drag-area"
                onDrop={this.handleDrop}
                onDragEnter={this.noop}
                onDragExit={this.noop} 
                onDragOver={this.noop}
            > 
                {/*<p><button type="button" onClick={this.startUpload}>Start Upload</button></p>*/}
                {
                    fileList.length ? 
                    <ul className="file-list">{fileList}</ul> :
                    <span className="upload-tip">Drop the files here...</span>
                }
            </div>
        );
    }
});

var File = React.createClass({
    render: function(){
        var status = this.props.status || 'ready',
            uploaded = this.props.uploaded || 0;

        return (
            <li>
                <span className="fn-left">{this.props.name} - {this.props.size/1000} kb</span>
                <span className="status">{uploaded} - {status}</span>
            </li>
        );
    }
});

var FileManager = React.createClass({
    getInitialState: function(){
        return  {
            files: [],
            currentDir: ''
        }
    },

    componentDidMount: function(){
        this.loadDirInfo();
    },

    loadDirInfo: function (dir) {
        var xhr = $.ajax({
            type: 'GET',
            url: 'get-dir',
            data: {
                uploadDir: dir
            }
        }), me = this;

        xhr.done(function (data) {
            if ( data.err ) {
                return alert(data.err);
            }

            //缓存原始Dir
            !me.oriDir && (me.oriDir = data.currentDir)

            me.setState(data);
        });
    },


    handleItemClick: function(e){
        var el = e.currentTarget,
            isDir = (el.className.indexOf('cat-dir') != -1),
            target;

        if ( isDir ) {
            this.changeDir(el.textContent || el.innerText);
        }
    },

    handleBack: function(e){
        e.preventDefault();
        var cur = this.state.currentDir,
            dir = cur.substring(0, cur.lastIndexOf('/'));
        this.loadDirInfo(dir);
    },

    changeDir: function(target){
        var newDir = this.state.currentDir + '/' + target;
        this.loadDirInfo(newDir);
    },

    render: function(){
        var files = this.state.files,
            len = files.length,
            fileList = [],
            showBackNav = (this.oriDir != this.state.currentDir);

        for ( var i = 0; i<len; i++) {
            var file = files[i],
                cls = file.isDir ? 'cat-dir' : 'cat-file';

            fileList.push(<li className={cls} onClick={this.handleItemClick}>{file.name}</li>);
        }

        return (
            <dl>
                <dt>
                    <p>上传路径：{this.state.currentDir}</p>
                </dt>
                <dd>
                    <p>当前路径文件列表：</p>
                    <ul>
                        {
                            showBackNav &&
                            <p><a href="#" onClick={this.handleBack}>返回上一级目录</a></p>
                        }
                        {
                            fileList.length ? fileList : '空'
                        }
                    </ul>
                </dd>
            </dl>
        );
    }
});

React.render(<Uploader/>, document.getElementById('J_main'));
React.render(<FileManager/>, document.getElementById('J_fileManager'));