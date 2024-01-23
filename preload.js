const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('Instance', {
    getinstance: () => ipcRenderer.invoke("instance:getinstance"),
    start: (instance) => ipcRenderer.invoke("instance:launch", instance),
    getVersions: (autoGenerate) => ipcRenderer.invoke("instance:getversions", autoGenerate),
    newInstance: (parm) => ipcRenderer.invoke("intance:newIntance", parm)
})
contextBridge.exposeInMainWorld('Fractmod', {
    setinstance: (inst) => ipcRenderer.on("Fractmod:Setinstance", inst),
    downloadMod: (mod, instance) => ipcRenderer.invoke("Fractmod:downloadMod", mod, instance),
    getVersionConfig: (version) => ipcRenderer.invoke("Fractmod:getVersionConfig", version),
    handle: () => ipcRenderer.invoke("Fractmod:setFractmod")
})
contextBridge.exposeInMainWorld('tool', {
    getFile: (type) => ipcRenderer.invoke("tool:getFile", type),
    getauth: () => ipcRenderer.invoke("tool:getauth")
})
contextBridge.exposeInMainWorld("Api", {
    curse: process.env.CURSEFORGE_KEY
})