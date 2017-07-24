const electron = require('electron')
const { ipcMain, net } = require('electron');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600 })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

//主进程监听事件
ipcMain.on('create-directory', function (event, data) {
    var fs = require('fs');
    var pathdic = data;
    if (!fs.existsSync(pathdic)) {
        console.log('create-directory:', pathdic);
        fs.mkdirSync(pathdic);
    }
    event.sender.send('create-directory-methodback', 'create over'); //主进程干完活后告诉渲染进程
});

ipcMain.on('request', function (event, data) {
    const clientRequest = net.request('https://pics.lvjs.com.cn/mobile/node_pro/public/min/js/mHomePage/proList.js?v=071219472017')
    // console.log(request.headers);
    // if (Object.keys(request.headers).length > 0) {
    //     clientRequest.setHeader(request.headers);
    // }
    clientRequest.on('response', (response) => {
                var ssss = response.read.toString;
        console.log('resread',ssss);
        console.log('start', response.statusCode, response.headers);

        event.sender.send('remote.response-start', response.statusCode, response.statusMessage, response.headers);
        response.on('data', (chunk) => {
            event.sender.send('remote.response-body', chunk);
        })
        response.on('end', () => {
            event.sender.send('remote.response-complete');
        })
        event.sender.send('create-folder-result22', response.read);
    })
    clientRequest.on('finish', () => {
        console.log('finish');
        event.sender.send('remote.request-finish');
    })
    clientRequest.on('abort', () => {
        console.log('abort');
        event.sender.send('remote.request-abort');
    })
    clientRequest.on('error', (error, a, b) => {
        console.log((typeof error), error.toString())
        event.sender.send('remote.request-error', error.toString());
    })
    clientRequest.end()

    console.log(data); //1111
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.