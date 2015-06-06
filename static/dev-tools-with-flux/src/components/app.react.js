var React = require('react'),
    Uploader = require('./uploader.react'),
    FileMananger = require('./file-manager.react'),
    Store = require('../stores/app-store');


var App = React.createClass({
    getInitialState: function () {
        return Store.getAll()
    },
    componentDidMount: function() {
        Store.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        Store.removeChangeListener(this._onChange);
    },

    _onChange: function(){
        var state = Store.getAll();
        this.setState(state);
    },

    render: function(){
        return (
            <div>
                <aside className="file-manager">
                    <FileMananger currentDir={Store.getCurrentDir()} files={Store.getCurrentDirFileList()}/>
                </aside>
                <div className="main">
                    <Uploader files={Store.getUploaderFileList()} currentDir={Store.getCurrentDir()} />
                </div>
            </div>
        );
    }
});


module.exports = App;