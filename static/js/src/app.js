var Uploader = React.createClass({
    getInitialState: function() {
        return {
        };
    },

    handleClick: function() {
        console.log(arguments);
    },

    handleDrop: function() {
        console.log(arguments);
    },

    render: function() {
        return (
            <div className="drag-area" onDrop={{this.handleDrop}} onClick={{this.handleClick}}>
                <span>Drop the files here...</span>
            </div>
        );
    }
});



React.render(<Uploader/>, document.getElementById('J_main'))