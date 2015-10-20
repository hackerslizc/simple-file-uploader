var React = require('react'),
    AppActions = require('../actions/app-actions');

var File = React.createClass({
    handleDel: function(e){
        this.noop(e);
        this.props.delFn(this.getIdx(e));
    },

    handleItemClick: function(e){
        if ( e.currentTarget.className == 'cat-dir') {
            this.noop(e);
        }
        this.props.handleItemClick(e, this.getIdx(e));
    },
    noop: function(e){
        e.preventDefault();
        e.stopPropagation();
    },
    handleDev: function(e){
        this.noop(e);
        var idx = this.getIdx(e);
        this.props.handleDev(idx);
    },
    getIdx: function(e){
        return e.currentTarget.getAttribute('data-idx');
    },
    render: function(){
        var cls = this.props.cls,
            name = this.props.name,
            showDev = this.props.showDev,
            href = (cls === 'cat-file') ? this.props.staticPath + '/' + name : '#';

            //console.log(this.props.staticPath, href);

        return (
            <li className={cls} onClick={this.handleItemClick} data-idx={this.props.idx}>
            
                <a className="file-name" title={name} href={href} target="_blank">{name}</a>

                <span className="ctl-btns">
                    <a href="#" className="del" onClick={this.handleDel} 
                    data-idx={this.props.idx}>删除</a>

                    {
                        showDev && 
                        <a href="#" className="dev" onClick={this.handleDev} 
                        data-idx={this.props.idx}>部署</a>
                    }
                </span>
            </li>
        );
    }
});

module.exports = File;