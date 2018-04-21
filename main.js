 const  {app, BrowserWindow, Menu} = require('electron');

const electron = require('electron');
//const app = electron.app;
//const BrowserWindow = electron.BrowserWindow;


let mainWindow;

 const template = [
   {
     label: 'Edit', id: '2',
     submenu: [
       {role: 'undo'},
       {role: 'redo'},
       {type: 'separator'},
       {role: 'cut'},
       {role: 'copy'},
       {role: 'paste'},
       {role: 'pasteandmatchstyle'},
       {role: 'delete'},
       {role: 'selectall'}
     ]
   },
   {
     label: 'View',
     submenu: [
       {role: 'toggledevtools'},
       {type: 'separator'},
       {role: 'resetzoom'},
       {role: 'zoomin'},
       {role: 'zoomout'},
       {type: 'separator'},
       {role: 'togglefullscreen'}
     ]
   },
   {
     role: 'window',
     submenu: [
       {role: 'minimize'},
       {role: 'close'}
     ]
   }
 ]

 if (process.platform === 'darwin') {
   template.unshift({
     label: app.getName(),
     submenu: [
       {role: 'quit'}
     ]
   })
 }

 if (process.platform === 'win32') {
   template.unshift({
     label: 'File',
     submenu: [
       {role: 'quit'}
     ]
   })
 }

   const menu = Menu.buildFromTemplate(template)

  app.on('ready', () => {
    mainWindow = new BrowserWindow({width: 1280, height: 800});

    // Open Development Tools
    mainWindow.openDevTools();

    mainWindow.loadURL('file://' + __dirname + '/index.html');

     Menu.setApplicationMenu(menu)

  });

  app.on('window-all-closed', () => {
    app.quit();
  });
