var React = require('react'),
    App  = require('./components/app.react');


function render(hash){    
    hash = hash || window.location.hash.substr(1) || '';
    React.render(<App hash={hash}/>, document.querySelector('#J_app'));
}


window.addEventListener('hashchange', function () {
    var hash = window.location.hash.substr(1);
    render(hash);
});

render();
