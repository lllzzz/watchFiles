#!/usr/bin/env node
/**
 * 监听文件变化小工具
 */

var watch     = require('watch'),
    moment    = require('moment'),
    commander = require('commander');

commander
  .version('0.0.1')
  .usage('[options] <file>')
  .option('-r, --rootPath <path>', 'watch root path')
  .parse(process.argv);

var callbackModulePath = commander.args[0];
if (!callbackModulePath) {
    console.log('ERROR: callback script file lost');
    return;
}

var rootPath = commander.rootPath;
if (!rootPath) {
    console.log('ERROR: rootPath lost');
    return;
}

var userCallback = require(callbackModulePath).callback;
if (typeof userCallback !== 'function') {
    console.log('ERROR: callback is not a function')
    return;
}

watch.watchTree(rootPath, function (f, curr, prev) {
    var time    = moment().format('YYYY/MM/DD HH:mm:ss'),
        path    = f.toString();

    if (typeof f == "object" && prev === null && curr === null) {      // Finished walking the tree
    } else if (prev === null) {      // f is a new file
    } else if (curr.nlink === 0) {      // f was removed
    } else {      // f was changed
        console.log('[' + time + ']CHANGED_FILE: ' + path);
        userCallback();
    }
});
