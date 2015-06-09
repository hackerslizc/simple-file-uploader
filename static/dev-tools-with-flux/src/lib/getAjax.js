function getAjax(opt) {
    var url = opt.url,
        success = opt.success;

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) {
            var res = xhr.responseText;

            if ( opt.dataType == 'json') {
                res = JSON.parse(res);
            }
            success(res);
        };
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
}

module.exports = getAjax;