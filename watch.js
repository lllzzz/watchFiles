#!/usr/bin/env node
/**
 * 监听文件变化小工具
 */
var watch     = require('watch'),
    moment    = require('moment'),
    commander = require('commander'),
    fs        = require('fs'),
    daemon    = require('daemon');

var isStop = false,
    logFile = 'watchFile_';

commander
  .version('0.0.1')
  .usage('[options] <file>')
  .option('-w, --watchPath <path>', 'watch root path')
  .option('-l, --logPath <path>', 'log file path')
  .option('-p, --pidPath <path>', 'pid file path')
  .arguments('[cmd]', 'cmd')
  .action(function(cmd) {
    isStop = cmd === 'stop' ? true : false;
  })
  .parse(process.argv);

// stop service
if (!!isStop) {
    var pidPath = commander.pidPath || './writeFile.pid';
    try {
        var pid = fs.readFileSync(pidPath, {encoding: 'utf8'});
        try {
            process.kill(pid);
        } catch (e) {
            console.error(e.toString());
        }
        fs.unlinkSync(pidPath)
        process.exit();
    } catch (e) {
        console.error(e.toString());
        process.exit();
    }
}

var callbackModulePath = commander.args[0];
if (!callbackModulePath) {
    console.log('ERROR: callback script file lost');
    return;
}

var watchPath = commander.watchPath;
if (!watchPath) {
    console.log('ERROR: watchPath lost');
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
    fs.appendFile(logPath + logFile + time + ".log", data + "\n", function(err) {
        if (err) throw err;
    })
}

// 转为守护
daemon();
fs.writeFile('./writeFile.pid', process.pid)

watch.watchTree(watchPath, function (f, curr, prev) {
    var time    = moment().format('YYYY/MM/DD HH:mm:ss'),
        path    = f.toString();

    if (typeof f == "object" && prev === null && curr === null) {      // Finished walking the tree
    } else if (prev === null) {      // f is a new file
    } else if (curr.nlink === 0) {      // f was removed
    } else {// f was changed
        // console.log('[' + time + ']CHANGED_FILE: ' + path);
        if (path.indexOf(logFile) !== -1) return;
        logger('[' + time + ']CHANGED_FILE: ' + path);
        userCallback(path);
    }
});
