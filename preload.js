const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('instance', {
    getinstance: () => ipcRenderer.invoke("instance:getinstance"),
    start: (instance) => ipcRenderer.invoke("instance:launch", instance),
    getVersions: (autoGenerate) => ipcRenderer.invoke("instance:getversions", autoGenerate)
})
contextBridge.exposeInMainWorld('Fractmod', {
    setinstance: (inst) => ipcRenderer.on("Fractmod:Setinstance", inst),
    downloadMod: (mod, instance) => ipcRenderer.invoke("Fractmod:downloadMod", mod, instance)
})
contextBridge.exposeInMainWorld('tool',{
    getFile: (type) => ipcRenderer.invoke("tool:getFile",type)
})