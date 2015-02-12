(function () {

	var App = {
		init: function () {
			var $el = $('#J_fileManager');

			this.$el = $el;
			this.$back = $el.find('.J_back');
			this.$dirList = $el.find('.J_dirList');
			this.$curDir = $el.find('.J_currentDir');

			this.listen();
			this.loadDirInfo();
		},

		listen: function () {
			var me = this;



			me.$back.click(function () {
				var cur = me.$curDir.text(),
					idx = cur.lastIndexOf('/');

				cur = cur.substring(0,idx);
				me.$curDir.text(cur);

				me.loadDirInfo(cur);
			});

			me.$dirList.delegate('a', 'click', function () {
				me.loadDirInfo($(this).data('dir'));
			});
		},

		loadDirInfo: function (dir) {
			var xhr = $.ajax({
				type: 'GET',
				url: 'get-dir',
				data: {
					uploadDir: dir
				}
			}), me = this;

			xhr.done(function (data) {
				if ( data.err ) {
					return alert(data.err);
				}

				if ( !me.originDir ) {
					me.originDir = data.currentDir;
				}

				me.renderView(data.currentDir, data.files);
			});
		},

		renderView: function (currentDir, directories) {
			var temp = ['<li>文件将上传到当前目录</li>'];

			if ( this.originDir == currentDir) {
				this.$back.hide();
			} else {
				this.$back.show();
			}

			this.$curDir.text(currentDir);
			
			if ( directories.length ) {
				directories.forEach(function(dir){
					var absoluteDir = currentDir + '/' + dir;
					temp.push('<li><a href="#" data-dir="'+absoluteDir+'">'+dir+'</a></li>');
				});
			}
			this.$dirList.html(temp.join(''));
		}
	};

	//入口
	App.init();

	window.App = App;
})();