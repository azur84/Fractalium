const { app, BrowserWindow, ipcMain, dialog,Menu } = require('electron');
const { homedir, platform } = require('node:os');
const path = require('node:path');
const { existsSync, readdirSync, readFileSync } = require('node:fs');
const { getVersionConfig, Instance, loaderLaunch, download, getVersionsJson } = require('./launchercore');

function getFractaHome() {
    const home = homedir()
    switch (platform()) {
        case 'darwin': console.log("Darwin platform(MacOS, IOS etc)");
            process.env.fractaHome = path.join(home, 'Library', 'Application Support', '.fractalium');
            break;
        case 'linux': console.log("Linux Platform");
            process.env.fractaHome = path.join(home, '.local', 'share', '.fractalium')
            break;
        case 'win32': console.log("windows platform");
            process.env.fractaHome = path.join(home, 'AppData', 'Roaming', '.fractalium')
            break;
        default: console.error("unknown platform");
            process.exit(5)
    }
    return process.env.fractaHome
}
let fractaHome = getFractaHome()

function createBaseWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        icon: "./asset/image/mono 256.png",
        title: "Fractalium loading...",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),

        }
    })
    win.loadFile('index.html')
    win.webContents.setWindowOpenHandler(({ }) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: "./asset/image/mono 256.png",
                title: "Fractalium loading...",
                autoHideMenuBar: true
            }
        }
    })
    return win
}

app.whenReady().then(() => {
    createBaseWindow()
    ipcMain.handle('instance:getinstance', getInstance)
    ipcMain.handle('instance:launch', startInstance)
    ipcMain.handle('Fractmod:downloadMod', downloadMod)
    ipcMain.handle('instance:getversions', getVersionsJson)
    ipcMain.handle('tool:getFile', getFile)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createBaseWindow()
        }
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
function getInstance() {
    const gameDirectory = path.join(fractaHome, "gameDirectory")
    if (!existsSync(gameDirectory)) return []
    let Instancelist = []
    readdirSync(gameDirectory, { withFileTypes: true }).forEach((e) => {
        if (e.isDirectory()) {
            try {
                Instancelist.push(new InstanceInfo(e))
            } catch (e) { }
        }
    })
    return Instancelist
}
class InstanceInfo {
    name
    path
    config
    mods = []
    constructor(e) {
        this.name = e.name
        this.path = `${e.path}\\${this.name}`
        this.config = require(`${this.path}/config.json`)
        readdirSync(path.join(this.path, "mods"), { withFileTypes: true }).forEach((m) => {
            if (m.isFile() && m.name.slice(m.name.lastIndexOf(".")) == ".jar") {
                this.mods.push({
                    path: path.join(m.path, m.name),
                    name: m.name
                })
            }
        })
    }
    getVersion() { return getVersionConfig(this.config.version) }
}
function startInstance(event, instance) {
    return new Promise(async (resolve, reject) => {
        const mc = new Instance(instance.name, getVersionConfig(instance.config.version), instance.config.launch)
        const loader = new loaderLaunch()
        try {
            await loader.waitload()
            const pros = await mc.defaultLanch(undefined, undefined, loader)
            loader.send("Launched")
            resolve(pros)
        } catch (err) {
            console.error(err)
            BrowserWindow.getAllWindows().forEach((e) => {
                e.show()
            })
            loader.win.close()
        }
    })
}
function downloadMod(event, mod, instance) {
    return new Promise((resolve, reject) => {
        download(mod.downloadUrl, path.join(instance.path, "mods", mod.fileName)).then((e) => {
            resolve({
                success: true,
                mod: {
                    path: e,
                    name: mod.fileName
                }
            })
        }, (e) => {
            reject({
                success: false,
                reason: e,
                mod: {
                    name: mod.fileName
                }
            })
        }
        )
    })
}
function getFile(event, type) {
    return new Promise(async (resolve, reject) => {
        switch (type) {
            case "iconMod":
                const icon = await dialog.showOpenDialog({
                    title: "Select Mod Icons",
                    properties: ['openFile'],
                    filters: [
                        { name: "Mod Icon", extensions: ["png"] }
                    ]
                })
                if (icon.canceled) {
                    reject("canceled")
                } else {
                    resolve(`data:image/png;base64,${readFileSync(icon.filePaths[0]).toString("base64")}`)
                }
                break;

            default:
                break;
        }
    })
}

module.exports = {
    getFractaHome
}