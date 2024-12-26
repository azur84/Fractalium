import { BrowserWindow, ipcMain } from "electron";

ipcMain.on("app:openDevTools", (event) => {
    event.sender.openDevTools()
})

ipcMain.on("app:closeWindow", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
})

ipcMain.on("app:maximizeWindow", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
        win?.unmaximize()
    } else {
        win?.maximize()
    }
})

ipcMain.on("app:minimizeWindow", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
})