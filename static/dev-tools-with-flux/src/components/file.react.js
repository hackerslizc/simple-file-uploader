var React = require('react');

var File = React.createClass({
    render: function(){
        var status = this.props.status || 'ready',
            uploaded = this.props.uploaded || 0;

        return (
            <li>
                <span className="fn-left">{this.props.name} - {this.props.size/1000} kb</span>
                <span className="status">{uploaded}% - {status}</span>
            </li>
        );
    }
});

module.exports = File;