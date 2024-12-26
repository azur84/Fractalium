import dotenv from "dotenv";
import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'path';
dotenv.config({
    path: app.isPackaged ? path.join(__dirname, ".env") : path.join(__dirname, "../../", ".env")
})
import "./launcher_core"
import "./icp"

const iconpath = app.isPackaged ? path.join(__dirname, "assets", "fractalium.png") : path.join(__dirname, "../", "client", "assets", "images", "logo", "fractalium.png")
const appIcon = nativeImage.createFromPath(iconpath)

function createBaseWindow() {
    const win = new BrowserWindow({
        icon: appIcon,
        title: "Fractalium",
        show: false,
        webPreferences: {
            preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, "../", "preload.js"),
            devTools: !app.isPackaged
        },
        titleBarStyle: "hidden",
        titleBarOverlay: {
            height: 35,
            color: "#FFFFFF00",
            symbolColor: "#FFFFFF"
        },
    })
    win.setMenu(null)
    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, "index.html"))
    } else {
        win.loadURL("http://localhost:5173/")
    }
    win.once("ready-to-show", () => {
        win.show()
        if (process.argv.includes("-devtool")) win.webContents.openDevTools()
    })

    return win
}

app.whenReady().then(() => {
    createBaseWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createBaseWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})