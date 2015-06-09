function postAjax(opt) {
    var data = opt.data,
        url = opt.url,
        success = opt.success,
        progress = opt.progress;

    var params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

    xhr.upload.onprogress = function(e){
        progress && progress(e)
    };

    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) {
            var res = xhr.responseText;

            if ( opt.dataType == 'json' ) {
                res = JSON.parse(res);
            }
            
            success && success(res);
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}


module.exports = postAjax;