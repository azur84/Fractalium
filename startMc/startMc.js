const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('mc', {
    inload: (callback) => ipcRenderer.on("load",callback),
    loaded: () => ipcRenderer.send('loaded')
})