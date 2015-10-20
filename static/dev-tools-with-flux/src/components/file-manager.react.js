var React = require('react'),
    FileItem = require('./file-item.react'),
    GetAjax = require('../lib/getAjax'),
    PostAjax = require('../lib/post'),
    AppActions = require('../actions/app-actions');

var FileManager = React.createClass({
    componentDidMount: function(){
        this.loadDirInfo();
    },
 
    /**
     *  获取目录文件列表
     *  @param {string} dir
     */
    loadDirInfo: function (dir) {
        dir = dir || '';
        GetAjax({
            url: '/get-dir?uploadDir=' + dir,
            dataType: 'json',
            success: this.onDirLoaded
        })
    },

    /**
     *  目录获取成功回调，调用 AppActions 更新数据
     *  @param {obj} data
     */
    onDirLoaded: function(data){
        !this.oriDir && (this.oriDir = data.currentDir);
        AppActions.updateFileManagerData(data);
    },

    /**
     *  点击删除按钮回调
     *  @param {number} idx: 当前点击对象在fileList中的索引
     */
    handleDel: function(idx){
        var files = this.getFiles(),
            curFileName = files[idx].name,
            target = this.props.currentDir + '/' + curFileName,
            me = this;

        var bol = confirm('您确定要删除 ' + curFileName + ' ？');

        if ( bol ) {
            this.del(target, function(){
                me.props.files.splice(idx, 1);

                AppActions.updateFileManagerData({
                    files: me.props.files
                });

                AppActions.addLog('删除 "' + curFileName + '"成功');
            });
        }
    },

    /**
     *  点击列表回调函数
     *  @param {e} e: 点击事件对象
     *  @param {idx} idx: 点击对象的当前索引
     */
    handleItemClick: function(e, idx){
        var el = e.currentTarget,
            files = this.getFiles(),
            name = files[idx].name,
            isDir = (el.className.indexOf('cat-dir') != -1),
            target;

        if ( isDir ) {
            window.location.hash = this.props.currentDir + '/' + name;
            //this.changeDir(name);
        }
    },

    /**
     *  回退按钮回调
     *  @param {e} e: 点击事件对象
     */
    handleBack: function(e){
        e.preventDefault();
        var cur = this.props.currentDir,
            dir = cur.substring(0, cur.lastIndexOf('/'));
        window.location.hash = dir;
        //this.loadDirInfo(dir);
    },

    changeDir: function(target){
        var newDir = this.props.currentDir + '/' + target;
        this.loadDirInfo(newDir);
    },

    /**
     *  部署按钮点击回调
     *  @param {idx} idx: 点击对象索引
     */
    handleDev: function(idx){
        var files = this.getFiles(),
            target = this.props.currentDir + '/' + files[idx].name,
            me = this;

        this.dev(target, function(r){
            me.loadDirInfo(me.props.currentDir);
            AppActions.addLog(r.msg);
            AppActions.addLog('部署成功！');
        });
    },

    /**
     *  删除
     *  @param {string} target 删除路径
     *  @param {function} callback
     */
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

    /**
     *  解压部署 文件
     *  @param {string} target 部署对象路径
     *  @param {function} callback
     */
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

    /**
     *  获取当前文件列表
     *  @return {array} files: 当前文件列表数组
     */
    getFiles: function(){
        return this.props.files || [];
    },

    render: function(){        
        var files = this.getFiles(),
            len = files.length,
            fileList = [],
            currentDir = this.props.currentDir,
            showBackNav = (this.oriDir != currentDir);

        for ( var i = 0; i<len; i++) {
            var file = files[i],
                cls = file.isDir ? 'cat-dir' : 'cat-file',
                staticPath = 'http://172.25.47.49' + currentDir.replace(this.oriDir, '');


            var bol = (
                !file.isDir && 
                file.name.lastIndexOf('.zip') == (file.name.length - 4) && 
                file.name.indexOf('fe-') == 0 );


            fileList.push(
                <FileItem name={file.name} cls={cls} showDev={bol} idx={i} key={i} 
                staticPath = {staticPath}
                handleItemClick={this.handleItemClick} 
                handleDev={this.handleDev} 
                delFn={this.handleDel} />
            );
        }

        return (
            <dl>
                <dt>
                    <p>当前路径文件列表：</p>
                </dt>
                <dd>
                    <ul className="file-list" onClick={this.handleClick}>
                        {
                            showBackNav &&
                            <p><a href="#" onClick={this.handleBack}>返回上一级目录</a></p>
                        }

                        { fileList.length ? fileList : '当前目录为空' }
                    </ul>
                </dd>
            </dl>
        );
    }
});

module.exports = FileManager;