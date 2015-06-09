var AppDispatcher = require('../dispatcher/app-dispatcher'),
    Events = require('../lib/events'),
    AppStore;

var _store = {
        showLogs: false,
        logs:'',
        currentDir: '',
        uploaderFiles: [],
        currentDirFiles: []
    },
    CHANGE_EVT = 'change';


AppStore = {
    getAll: function(){
        return _store;
    },

    getLog: function(){
        return _store.logs;
    },

    addChangeListener: function(callback){
        this.on(CHANGE_EVT, callback);
    },

    removeChangeListener: function(callback){
        this.on(CHANGE_EVT, callback);
    },

    emitChange: function(data){
        this.trigger(CHANGE_EVT);
    },

    getCurrentDir: function(){
        return _store.currentDir;
    },

    getUploadIdx: function(){
        return _store.uploadIdx;
    },

    getUploaderFileList: function(){
        return _store.uploaderFiles;
    },
    getCurrentDirFileList: function(){
        return _store.currentDirFiles;
    }

};

function addFileToUploader(files){
    _store.uploaderFiles = _store.uploaderFiles.concat(files);
}

function updateFileByIdx(idx, file){
    _store.uploaderFiles[idx] = file;
}

function updateFileMananger(data){
    if ( data.files ) {
        _store.currentDirFiles = data.files;
    }

    if ( data.currentDir ) {
        _store.currentDir = data.currentDir;
    }
}

function addFileToCurFileList(file){    
    if ( !fileExits(file) ) {
        _store.currentDirFiles.push({
            name: file.name,
            isDir: false
        });
    }
}

function addLog(log){
    _store.logs = ('\n' + log + _store.logs);
}

function fileExits(file){
    for ( var i in _store.currentDirFiles ) {
        if ( _store.currentDirFiles[i].name === file.name) {
            return true;
        }
    }
    return false;
}

Events.mixTo(AppStore);

AppDispatcher.register(function (payload) {
    switch (payload.actionType) {
        case 'add-files':
            addFileToUploader(payload.files);
            AppStore.emitChange(CHANGE_EVT);
        break;

        case 'update-file-by-idx':
            updateFileByIdx(payload.idx, payload.file);
            AppStore.emitChange(CHANGE_EVT);
        break;

        case 'update-file-mananger':
            updateFileMananger(payload.data);
            AppStore.emitChange(CHANGE_EVT);
        break;

        case 'file-uploaded':
            addFileToCurFileList(payload.file);
            AppStore.emitChange(CHANGE_EVT);
        break;

        case 'add-log':
            addLog(payload.log);
            AppStore.emitChange(CHANGE_EVT);
        break;
    }
});

module.exports = AppStore;