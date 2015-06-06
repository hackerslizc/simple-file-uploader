var React = require('react'),
    Uploader = require('./uploader.react'),
    FileMananger = require('./file-manager.react'),
    Store = require('../stores/app-store');


var App = React.createClass({
    getInitialState: function () {
        return Store.getAll()
    },
    componentDidMount: function() {
        //console.log(this.props.hash);
        this.refs.fileManager.loadDirInfo(this.props.hash)
        Store.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        Store.removeChangeListener(this._onChange);
    },

    componentWillReceiveProps: function(props){
        //console.log(props.hash);
        this.refs.fileManager.loadDirInfo(props.hash)
    },

    _onChange: function(){
        var state = Store.getAll();
        this.setState(state);
    },

    render: function(){
        var currentDir = Store.getCurrentDir();
        return (
            <div>
                <h2 style={{fontSize: '16px'}}>当前上传路径：{currentDir}</h2>
                <div>
                    <aside className="file-manager">
                        <FileMananger currentDir={currentDir} files={Store.getCurrentDirFileList()} ref="fileManager"/>
                    </aside>
                    <div className="main">
                        <Uploader files={Store.getUploaderFileList()} currentDir={Store.getCurrentDir()} />
                    </div>
                </div>
                <pre className="msg-console">{Store.getLog()}</pre>
            </div>
        );
    }
});


module.exports = App;