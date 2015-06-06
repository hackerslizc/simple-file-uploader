var AppDispatcher = require('../dispatcher/app-dispatcher'),
    Events = require('../lib/events'),
    AppStore;

var _store = {
        showLogs: false,
        currentDir: '',
        uploaderFiles: [],
        currentDirFiles: []
    },
    CHANGE_EVT = 'change';


AppStore = {
    getAll: function(){
        return _store;
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
    }
});

module.exports = AppStore;