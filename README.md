# watchFiles

## 简介
监听某个文件夹下的文件变化，执行用户自定义的方法。

## 使用方法
编写包含回调方法的JS脚本，当被监听文件夹下的文件发生改变，则执行回调。脚本必须导出名为callback的函数。

	./watch.js -p path_need_to_watched callback_script_file_path
	
