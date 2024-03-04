const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('Instance', {
    getinstance: () => ipcRenderer.invoke("instance:getinstance"),
    start: (instance) => ipcRenderer.invoke("instance:launch", instance),
    getVersions: (autoGenerate) => ipcRenderer.invoke("instance:getversions", autoGenerate),
    newInstance: (parm) => ipcRenderer.invoke("instance:newIntance", parm),
    openfolder: (instance) => ipcRenderer.invoke("instance:openfolder", instance),
    delete: (instance) => ipcRenderer.invoke("instance:delete", instance),
    import: (type, opt) => ipcRenderer.invoke("instance:import", type, opt),
    getModIcon: (path) => ipcRenderer.invoke("instance:geticon", path),
    deleteMod: (path) => ipcRenderer.invoke("instance:deletemod", path)
})
contextBridge.exposeInMainWorld('Fractmod', {
    setinstance: (inst) => ipcRenderer.on("Fractmod:Setinstance", inst),
    downloadMod: (mod, instance) => ipcRenderer.invoke("Fractmod:downloadMod", mod, instance),
    getVersionConfig: (version) => ipcRenderer.invoke("Fractmod:getVersionConfig", version),
    getcurrentInstance: () => ipcRenderer.invoke("Fractmod:handle"),
    open: (instance) => ipcRenderer.invoke("Fractmod:open", instance)
})
contextBridge.exposeInMainWorld('app', {
    getApps: () => ipcRenderer.invoke("app:get"),
    addApp: (icon, url) => ipcRenderer.invoke("app:add", url, icon)
})
contextBridge.exposeInMainWorld('tool', {
    getFile: (type) => ipcRenderer.invoke("tool:getFile", type),
    getauth: () => ipcRenderer.invoke("tool:getauth")
})
contextBridge.exposeInMainWorld("Api", {
    curse: process.env.CURSEFORGE_KEY
})
contextBridge.exposeInMainWorld("Config", {
    auth: (type) => ipcRenderer.invoke("config:auth", type),
    getram: () => ipcRenderer.invoke("config:getram"),
    setRam: (rams) => ipcRenderer.invoke("config:setram", rams),
    changeKeepLaunch: (value) => ipcRenderer.invoke("config:changekeeplaunch", value)
})