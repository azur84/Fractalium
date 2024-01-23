const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("auth", {
    finish: (name) => ipcRenderer.invoke("auth:finish", name)
})