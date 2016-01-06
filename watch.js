#!/usr/bin/env node
/**
 * 监听文件变化小工具
 */
var watch     = require('watch'),
    moment    = require('moment'),
    commander = require('commander'),
    fs        = require('fs'),
    daemon    = require('daemon');

commander
  .version('0.0.1')
  .usage('[options] <file>')
  .option('-p, --rootPath <path>', 'watch root path')
  .option('-l, --logPath <path>', 'log file path, default ')
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

var logPath = commander.logPath || '/usr/local/logs/';
try {
    var ret = fs.statSync(logPath);
} catch (e) {
    try {
        ret = fs.mkdirSync(logPath);
    } catch (e) {
        console.log(e.toString())
        return;
    }
}

var logger = function (data) {
    var time = moment().format('YYYYMMDD');
    fs.appendFile(logPath + "writeFile_" + time + ".log", data + "\n", function(err) {
        if (err) throw err;
    })
}

// 转为守护
daemon();
fs.writeFile('./writeFile.pid', process.pid)

watch.watchTree(rootPath, function (f, curr, prev) {
    var time    = moment().format('YYYY/MM/DD HH:mm:ss'),
        path    = f.toString();

    if (typeof f == "object" && prev === null && curr === null) {      // Finished walking the tree
    } else if (prev === null) {      // f is a new file
    } else if (curr.nlink === 0) {      // f was removed
    } else {      // f was changed
        // console.log('[' + time + ']CHANGED_FILE: ' + path);
        logger('[' + time + ']CHANGED_FILE: ' + path);
        userCallback();
    }
});
