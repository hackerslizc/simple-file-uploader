!function(a){
    var b=a({});
    a.subscribe=function(){b.on.apply(b,arguments)},
    a.unsubscribe=function(){b.off.apply(b,arguments)},
    a.publish=function(){b.trigger.apply(b,arguments)}
}(jQuery);

function prependMsg(msg){
    var $dis = $('#J_msgConsole');

    $dis.prepend(msg + '\n\n\n\n');
};

var Uploader = React.createClass({displayName: "Uploader",
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
                type: files[me.fileIdx].type,
                uploadDir: me.uploadDir
            }, xhr;

            xhr = $.ajax({
                type: 'POST',
                url: '/upload',
                data: JSON.stringify(curFile)
                ,
                xhr: function(){
                    var xhrObj = $.ajaxSettings.xhr();

                    xhrObj.upload.onprogress = function(e){
                        var tmp = Math.round(e.loaded / e.total * 100);

                        tmp = (tmp == 100) ? 99 : tmp;
                        updateProgress(tmp)
                    };

                    function updateProgress(progress){
                        me.state.files[me.fileIdx].uploaded = progress;
                        me.setState({
                            files: me.state.files
                        });
                    }

                    return xhrObj;      
                }
            });
            xhr.done(function(){
                files[me.fileIdx].uploaded = 100;
                files[me.fileIdx].status = 'uploaded';

                $.publish('file-uploaded', {name: files[me.fileIdx].name, isDir: false});

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
        var me = this;
        this.fileIdx = 0;
        this.onUploading = false;

        $.subscribe('upload-dir-changed', function(e, dir){
            console.log(dir);
            me.uploadDir = dir;
        });
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
                    React.createElement(File, {name: files[i].name, 
                          size: files[i].size, 
                          status: files[i].status, 
                          uploaded: files[i].uploaded})
                )
            }
        }

            console.log('render')

        return (


            React.createElement("div", {className: "drag-area", 
                onDrop: this.handleDrop, 
                onDragEnter: this.noop, 
                onDragExit: this.noop, 
                onDragOver: this.noop
            }, 
                /*<p><button type="button" onClick={this.startUpload}>Start Upload</button></p>*/
                
                    fileList.length ? 
                    React.createElement("ul", {className: "file-list"}, fileList) :
                    React.createElement("span", {className: "upload-tip"}, "Drop the files here...")
                
            )
        );
    }
});

var File = React.createClass({displayName: "File",
    render: function(){
        var status = this.props.status || 'ready',
            uploaded = this.props.uploaded || 0;

        return (
            React.createElement("li", null, 
                React.createElement("span", {className: "fn-left"}, this.props.name, " - ", this.props.size/1000, " kb"), 
                React.createElement("span", {className: "status"}, uploaded, "% - ", status)
            )
        );
    }
});

var FileManager = React.createClass({displayName: "FileManager",
    getInitialState: function(){
        return  {
            files: [],
            currentDir: ''
        }
    },

    componentDidMount: function(){
        var me = this;

        this.loadDirInfo();
        $.subscribe('file-uploaded', function(e, file){

            if ( fileExits(file) ) return;

            me.state.files.push(file);

            me.setState({
                files: me.state.files
            });
        });


        function fileExits(file){
            for ( var i in me.state.files ) {
                if ( me.state.files[i].name === file.name) {
                    return true;
                }
            }

            return false;
        }
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

            if ( me.oriDir != data.currentDir ) {
                $.publish('upload-dir-changed', data.currentDir)
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

    handleDel: function(e){
        var $el = $(e.currentTarget),
            curFileName = $el.next().text(),
            idx = $el.data('idx'),
            target = this.state.currentDir + '/' + curFileName;

        var bol = confirm('确定删除文件 ' + curFileName + ' ？'),
            me = this;

        if ( bol ) {
            this.del(target, function(){
                me.state.files.splice(idx, 1);
                me.setState({
                    files: me.state.files
                });

                prependMsg('删除' + curFileName + '成功');
            });
        }
    },

    handleDev: function(e){
        var $el = $(e.currentTarget),
            curFileName = $el.next().text(),
            target = this.state.currentDir + '/' + curFileName,
            me = this;

        this.dev(target, function(r){
            me.loadDirInfo(me.state.currentDir);
            prependMsg(r.msg);
            prependMsg('部署成功！');
        });
    },

    del: function(target, callback){
        $.ajax({
            type: 'POST',
            url: 'del',
            data: {
                target: target
            }   
        }).done(function(r){
            if ( r.status ) {
                callback && callback(r);
            } else {
                alert('Delete Error！Msg: ' + r.msg);
            }
        });
    },

    dev: function(target, callback){
        $.ajax({
            type: 'POST',
            url: 'develop.html',
            data: {
                absPath: target
            }   
        }).done(function(r){
            if ( r.status ) {
                callback && callback(r);
            } else {
                alert('Dev Error！Msg: ' + r.msg);
            }
        });
    },

    render: function(){
        var files = this.state.files,
            len = files.length,
            fileList = [],
            showBackNav = (this.oriDir != this.state.currentDir);

        for ( var i = 0; i<len; i++) {
            var file = files[i],
                cls = file.isDir ? 'cat-dir' : 'cat-file';

            var bol = (
                !file.isDir && 
                file.name.lastIndexOf('.zip') == (file.name.length - 4) && 
                file.name.indexOf('fe-') == 0 );


            fileList.push(
                React.createElement("li", {className: cls, onClick: this.handleItemClick}, 

                    
                        bol && React.createElement("span", {onClick: this.handleDev, className: "dev del"}, "部署"), 
                    
                                            
                        (!file.isDir && !bol) && React.createElement("span", {onClick: this.handleDel, className: "del", "data-idx": i}, "删除"), 
                    

                    React.createElement("span", {className: "file-name", title: file.name}, file.name)
                ));
        }

        return (
            React.createElement("dl", null, 
                React.createElement("dt", null, 
                    React.createElement("p", null, "上传路径：", this.state.currentDir)
                ), 
                React.createElement("dd", null, 
                    React.createElement("p", null, "当前路径文件列表："), 
                    React.createElement("ul", {className: "file-list"}, 
                        
                            showBackNav &&
                            React.createElement("p", null, React.createElement("a", {href: "#", onClick: this.handleBack}, "返回上一级目录")), 
                        
                        
                            fileList.length ? fileList : '当前目录为空'
                        
                    )
                )
            )
        );
    }
});

React.render(React.createElement(Uploader, null), document.getElementById('J_main'));
React.render(React.createElement(FileManager, null), document.getElementById('J_fileManager'));