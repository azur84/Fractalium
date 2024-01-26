const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("firstlaunch", {
    install: (callback) => ipcRenderer.on("Firstlaunch:finishinstall", callback),
    auth: (type) => ipcRenderer.invoke("Firstlaunch:auth", type),
    stop: () => ipcRenderer.invoke("Firstlaunch:stop"),
    ram: () => ipcRenderer.invoke("Firstlaunch:ram"),
    mcram: (ram) => ipcRenderer.invoke("Firstlaunch:mcram",ram)
})