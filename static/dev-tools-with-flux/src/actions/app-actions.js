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
    }
};

module.exports = AppActions;