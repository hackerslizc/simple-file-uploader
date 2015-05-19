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



			me.$back.click(function (e) {
				var cur = me.$curDir.text(),
					idx = cur.lastIndexOf('/');

				e.preventDefault();

				cur = cur.substring(0,idx);
				me.$curDir.text(cur);

				me.loadDirInfo(cur);
			});

			me.$dirList.delegate('a', 'click', function (e) {
				e.preventDefault();

				var $t = $(this),
					dir = $t.data('dir');

				if ( !$t.data('isdir') ) {
					if ( this.className.match('J_del')) {
						var fileName = $t.prev().text();
						var confirm = window.confirm('确定删除文件：“' + fileName + '” ？');

						if ( confirm ) {
							me.del(dir, function(){
								$t.closest('li').remove();
							});
						}
					}
				} else {
					me.loadDirInfo(dir);
				}

			});
		},

		del: function(dir, callback){
			var me = this;

			$.ajax({
				type: 'POST',
				url: 'del',
				data: {
					target: dir
				}	
			}).done(function(r){
				if ( r.status ) {
					callback && callback();
					//me.loadDirInfo(me.$curDir.text())
				} else {
					alert('Delete Error！Msg: ' + r.msg);
				}
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
				directories.forEach(function(obj){

					var tmpHTML = '';

					var absoluteDir = currentDir + '/' + obj.name;

					if (obj.isDir) {
						tmpHTML = '<li><a href="#" data-isdir="'+obj.isDir+'" data-dir="'+absoluteDir+'">'+obj.name+'</a></li>';
					} else {						
						tmpHTML = '<li><span>'+obj.name+'</span> <a href="#" class="J_del del-btn" data-dir="'+absoluteDir+'">X</a></li>';
					}

					temp.push(tmpHTML);
				});
			}
			this.$dirList.html(temp.join(''));
		}
	};

	//入口
	App.init();

	window.App = App;
})();