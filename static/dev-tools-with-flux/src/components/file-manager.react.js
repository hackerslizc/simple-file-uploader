var React = require('react'),
    FileItem = require('./file-item.react'),
    GetAjax = require('../lib/getAjax'),
    PostAjax = require('../lib/post'),
    AppActions = require('../actions/app-actions');

var FileManager = React.createClass({
    getInitialState: function(){
        return  {
            files: [],
            currentDir: ''
        }
    },

    componentDidMount: function(){
        var me = this;

        this.loadDirInfo();

        //获取上传完成的files

        function fileExits(file){
            for ( var i in me.props.files ) {
                if ( me.props.files[i].name === file.name) {
                    return true;
                }
            }

            return false;
        }
    },

    loadDirInfo: function (dir) {
        dir = dir || '';
        GetAjax({
            url: '/get-dir?uploadDir=' + dir,
            dataType: 'json',
            success: this.onDirLoaded
        })
    },

    onDirLoaded: function(data){
        !this.oriDir && (this.oriDir = data.currentDir);
        AppActions.updateFileManagerData(data);
    },

    handleDel: function(idx){
        var files = this.getFiles(),
            curFileName = files[idx].name,
            target = this.props.currentDir + '/' + curFileName,
            me = this;

        var bol = confirm('确定删除文件 ' + curFileName + ' ？');

        if ( bol ) {
            this.del(target, function(){
                me.props.files.splice(idx, 1);

                AppActions.updateFileManagerData({
                    files: me.props.files
                });

                //prependMsg('删除' + curFileName + '成功');
            });
        }
    },

    handleItemClick: function(e, idx){
        var el = e.currentTarget,
            files = this.getFiles(),
            name = files[idx].name,
            isDir = (el.className.indexOf('cat-dir') != -1),
            target;

        if ( isDir ) {
            this.changeDir(name);
        }
    },

    handleBack: function(e){
        e.preventDefault();
        var cur = this.props.currentDir,
            dir = cur.substring(0, cur.lastIndexOf('/'));
        this.loadDirInfo(dir);
    },

    changeDir: function(target){
        var newDir = this.props.currentDir + '/' + target;
        this.loadDirInfo(newDir);
    },


    handleDev: function(idx){
        var files = this.getFiles(),
            target = this.props.currentDir + '/' + files[idx].name,
            me = this;

        this.dev(target, function(r){
            me.loadDirInfo(me.props.currentDir);
            //prependMsg(r.msg);
            //prependMsg('部署成功！');
        });
    },

    del: function(target, callback){
        PostAjax({
            url: '/del',
            data: {
                target: target
            },
            dataType: 'json',
            success: function(r){
                if ( r.status ) {
                    callback && callback(r);
                } else {
                    alert('Delete Error！Msg: ' + r.msg);
                }
            }
        });
    },

    dev: function(target, callback){
        PostAjax({
            url: '/develop',
            data: {
                absPath: target
            },
            dataType: 'json',
            success: function(r){
                if ( r.status ) {
                    callback && callback(r);
                } else {
                    alert('Dev Error！Msg: ' + r.msg);
                }
            }
        });
    },

    getFiles: function(){
        return this.props.files || [];
    },

    render: function(){        
        var files = this.getFiles(),
            len = files.length,
            fileList = [],
            currentDir = this.props.currentDir,
            showBackNav = (this.oriDir != currentDir);

        console.log(showBackNav);

        for ( var i = 0; i<len; i++) {
            var file = files[i],
                cls = file.isDir ? 'cat-dir' : 'cat-file';

            var bol = (
                !file.isDir && 
                file.name.lastIndexOf('.zip') == (file.name.length - 4) && 
                file.name.indexOf('fe-') == 0 );


            fileList.push(
                <FileItem name={file.name} cls={cls} key={i} showDev={bol} idx={i} key={i} 
                handleItemClick={this.handleItemClick} 
                handleDev={this.handleDev} 
                delFn={this.handleDel} />
            );
        }

        return (
            <dl>
                <dt>
                    <p>上传路径：{currentDir}</p>
                </dt>
                <dd>
                    <p>当前路径文件列表：</p>
                    <ul className="file-list" onClick={this.handleClick}>
                        {
                            showBackNav &&
                            <p><a href="#" onClick={this.handleBack}>返回上一级目录</a></p>
                        }
                        {
                            fileList.length ? fileList : '当前目录为空'
                        }
                    </ul>
                </dd>
            </dl>
        );
    }
});

module.exports = FileManager;