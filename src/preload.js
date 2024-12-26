const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld("launcher", {
    getInstances: () => ipcRenderer.invoke("launcher:getInstances"),
    createInstance: (opt) => ipcRenderer.invoke("launcher:createInstance", opt),
    getInstance: (name) => ipcRenderer.invoke("launcher:getInstance", name),
    startInstance: (name, opt) => ipcRenderer.send("launcher:startInstance", name, opt),
    account: {
        getAccount: () => ipcRenderer.invoke("account:getAccount"),
        openAccount: () => ipcRenderer.invoke("account:openAccount"),
        setDefault: (id) => ipcRenderer.send("account:setDefault", id)
    }
})

contextBridge.exposeInMainWorld("app", {
    openDevTools: () => ipcRenderer.send("app:openDevTools"),
    closeWindow: () => ipcRenderer.send("app:closeWindow"),
    maximizeWindow: () => ipcRenderer.send("app:maximizeWindow"),
    minimizeWindow: () => ipcRenderer.send("app:minimizeWindow")
})