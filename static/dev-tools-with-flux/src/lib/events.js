/*
 *  自定义事件
 *  thanks to http://backbonejs.org/#Events
 */
function Events(){
}

Events.fn = Events.prototype;

Events.fn.on = function(name, callback, context){
    var temp;
    if ( !checkArg('on', name, this, [callback, context]) || !callback ) return this;

    this._events = this._events || {};
    temp = this._events[name] = this._events[name] || [];

    temp.push({
        callback: callback,
        context: context
    });

    return this;
};

Events.fn.one = function(name, callback, context){
    var me = this;

    var cb = function(){
        me.off(name, cb);
        callback.apply(context || me, arguments);
    };

    me.on(name, cb, context);
};

Events.fn.off = function(name, callback, context){
    var names,
        tempEvArr,
        tempEv,
        remaining = [];

    if (!checkArg('off', name, this, [callback, context])) return this;

    if (!arguments.length) {
        delete this._events;
        return this;
    }

    names = name ? [name] : getkeys(this._events);

    for (var i = 0, len = names.length; i < len; i++) {
        name = names[i];
        tempEvArr = this._events[name];

        if (!tempEvArr) {
            continue;
        }

        if (!callback && !context) {
            delete this._events[name];
            continue;
        }

        for (var j = 0, len1 = tempEvArr.length; j < len1; j++) {

            tempEv = tempEvArr[j];

            if (callback && callback !== tempEv.callback || context && context !== tempEv.context) {
                remaining.push(tempEv);
            }
        }

        if ( remaining.length ) {
            this._events[name] = remaining;
        } else {
            delete this._events[name];
        }
    }

    return this;
};

Events.fn.trigger = function(name){
    if (!this._events) return this;

    var args = Array.prototype.slice.call(arguments, 1),
        tempEv = this._events[name];

    if (!checkArg('trigger', name, this, args)) return this;

    if (tempEv) {
        trigger(tempEv, args, this);
    }

    if (this._events.all) {
        trigger(this._events.all, arguments, this);
    }


    return this;

};



Events.fn.once = Events.fn.one;

Events.mixTo = function(target){
    var eventsInstance = Events.fn;
    target = (typeof target === 'function') ? target.prototype : target;
    mix(target, eventsInstance);
};


//辅助函数
function checkArg(type, name, _this, other) {

    var splitter = /\s+/;

    if ( !name ) return true;

    if ( isObject(name) ) {
        for (var key in name) {
            _this[type].apply(_this, [key, name[key]].concat(other));
        }

        return false;
    }

    if (splitter.test(name)) {
        var names = name.split(splitter);
        for (var i = 0, len = names.length; i < len; i++) {
            _this[type].apply(_this, [names[i]].concat(other));
        }
        return false;
    }


    return true;
}


function trigger(events, args, ctx) {
    var len = events.length,
        ev,
        i = -1;
    while (++i < len) {
        (ev = events[i]).callback.apply(ev.context || ctx, args);
    }
}


function isObject(obj){
    return Object.prototype.toString.call(obj) === '[object Object]';
}

function mix(target, base, exceptList) {
    for (var key in base) {
        if ( base.hasOwnProperty(key) ) {
            target[key] = base[key];
        }
    }
}


module.exports = Events;