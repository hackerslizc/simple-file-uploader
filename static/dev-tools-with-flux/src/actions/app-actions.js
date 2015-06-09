var AppDispatcher = require('../dispatcher/app-dispatcher');

var AppActions = {

    /**
     *  添加文件到上传列表
     *  @param {array} files
     */
    addFiles: function (files) {
        AppDispatcher.dispatch({
            actionType: 'add-files',
            files: files
        });
    },

    /**
     *  通过idx更新文件列表文件
     *  @param {number} idx
     */
    updateFileByIdx: function(idx, file){
        AppDispatcher.dispatch({
            actionType: 'update-file-by-idx',
            idx: idx,
            file: file
        });
    },

    /**
     *  通过idx更新文件列表文件
     *  @param {number} idx
     */
    updateFileManagerData: function(data){
        AppDispatcher.dispatch({
            actionType: 'update-file-mananger',
            data: data
        });
    },

    /**
     *  文件上传成功事件
     *  @param {number} idx
     */
    fileUploaded: function(file){
        AppDispatcher.dispatch({
            actionType: 'file-uploaded',
            file: file
        });
    },

    /**
     *  添加日志记录
     *  @param {string} log
     */
    addLog: function(log){
        AppDispatcher.dispatch({
            actionType: 'add-log',
            log: log
        });
    }
};

module.exports = AppActions;