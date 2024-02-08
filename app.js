const { app, BrowserWindow, ipcMain, dialog, Menu, nativeImage, Tray } = require('electron');
const { homedir, platform } = require('node:os');
const path = require('node:path');
const { existsSync, readdirSync, readFileSync, rmSync, mkdir, writeFile, mkdirSync, writeFileSync } = require('node:fs');
const { getVersionConfig, Instance, loaderLaunch, download, getVersionsJson, auth, getConfigJson, createVersionsJson, installJre, firstLaunch, crack } = require('./launchercore');
require('dotenv').config();
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
        width: 877,
        height: 644,
        minWidth: 877,
        minHeight: 644,
        icon: nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256.png')),
        title: "Fractalium loading...",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    win.loadFile('index.html')
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.slice(0, 8) == "file:///") {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    width: 877,
                    height: 644,
                    minWidth: 877,
                    minHeight: 644,
                    icon: "./asset/image/mono 256.png",
                    title: "Fractalium loading...",
                    autoHideMenuBar: true,
                    webPreferences: {
                        preload: path.join(__dirname, 'preload.js'),
                    },
                },
            }
        }
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: "./asset/image/mono 256.png",
                title: "Fractalium loading...",
                autoHideMenuBar: true,
                parent: BrowserWindow.getFocusedWindow()
            }
        }
    })
    let inst = []
    getInstance().forEach((e) => {
        const icon = e.config.icon
        const name = e.name
        inst.push({
            icon: nativeImage.createFromDataURL(icon).resize({ height: 16, width: 16 }),
            label: name,
            click: () => startInstance(undefined, e)
        })
    })
    const menu = Menu.buildFromTemplate([
        {
            label: "Home",
            click: () => win.webContents.loadURL(path.join(__dirname, 'index.html'))
        },
        {
            label: "Option",
            submenu: [
                {
                    label: "Authentification",
                    submenu: [
                        {
                            label: "Prenium",
                            click: (menu, winparent) => {
                                auth(winparent).then((e) => {
                                    const config = getConfigJson()
                                    config.auth = e
                                    writeFileSync(path.join(fractaHome, "config.json"), JSON.stringify(config))
                                })
                            }
                        },
                        {
                            label: "Crack",
                            click: async (menu, winparent) => {
                                crack(winparent)
                            }
                        }
                    ]
                },
                {
                    label: "Ram",
                },
                {
                    label: "Reset",
                    submenu: [
                        {
                            label: "Version.json",
                            click: async (menu) => {
                                menu.visible = false
                                await createVersionsJson()
                                menu.visible = true
                            },
                        },
                        {
                            label: "Jre",
                            click: async (menu) => {
                                menu.visible = false
                                await installJre()
                                menu.visible = true
                            }
                        }
                    ]
                }
            ]
        },
        {
            label: "Fast start",
            submenu: inst
        }
    ])
    win.setMenu(menu)
    return win
}
function newFractmod(event) {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.webContents.setWindowOpenHandler(({ url }) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: "./asset/image/mono 256.png",
                title: "Fractalium loading...",
                autoHideMenuBar: true,
                parent: win
            }
        }
    })
}

app.whenReady().then(() => {
    const config = getConfigJson()
    if (!config?.valid) {
        firstLaunch().then(() => {
            createBaseWindow()
        })
    } else {
        createBaseWindow()
    }
    ipcMain.handle('instance:getinstance', getInstance)
    ipcMain.handle('instance:launch', startInstance)
    ipcMain.handle('Fractmod:downloadMod', downloadMod)
    ipcMain.handle('instance:getversions', getVersionsJson)
    ipcMain.handle('tool:getFile', getFile)
    ipcMain.handle("Fractmod:getVersionConfig", getVersionConfigHandle)
    ipcMain.handle("Fractmod:setFractmod", newFractmod)
    ipcMain.handle("intance:newIntance", newInstance)
    ipcMain.handle("Fractmod:open", openFractmod)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createBaseWindow()
        }
    })
    tray()
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
        if (!existsSync(path.join(this.path, "mods"))) return
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
            mc.client.once("close", () => {
                BrowserWindow.getAllWindows().forEach((e) => {
                    e.show()
                })
                try {
                    loader.win.close()
                } catch (err) { }
            })
            resolve(pros)
        } catch (err) {
            console.error(err)
            dialog.showErrorBox("Launch mc error", err)
        }
    })
}
function downloadMod(event, mod, instance) {
    return new Promise((resolve, reject) => {
        let fileremove = []
        if (instance.mods.some((e) => e.name.split("-")[0] == mod.fileName.split("-")[0])) {
            instance.mods.filter((e) => e.name.split("-")[0] == mod.fileName.split("-")[0]).forEach((e) => {
                rmSync(e.path)
                fileremove.push(e)
            })
        }
        download(mod.downloadUrl, path.join(instance.path, "mods", mod.fileName)).then((e) => {
            resolve({
                success: true,
                mod: {
                    path: e,
                    name: mod.fileName
                },
                remove: fileremove
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
                const icon = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
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
function getVersionConfigHandle(event, version) {
    return getVersionConfig(version)
}
function newInstance(event, Object) {
    const instancepath = path.join(fractaHome, "gameDirectory", Object.name)
    mkdirSync(path.join(instancepath, "mods"), { recursive: true })
    const configfile = {
        version: Object.version,
        nickname: Object.nickname,
        icon: Object.icon,
        decription: Object.decription
    }
    const configpath = path.join(instancepath, "config.json")
    writeFileSync(configpath, JSON.stringify(configfile))
}
function openFractmod(event, instance) {
    const win = new BrowserWindow({
        width: 877,
        height: 644,
        minWidth: 877,
        minHeight: 644,
        icon: nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256.png')),
        title: "Fractalium loading...",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    win.webContents.setWindowOpenHandler(({ url }) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256.png')),
                title: "Fractalium loading...",
                autoHideMenuBar: true,
                parent: win
            }
        }
    })
    win.loadFile(path.join(__dirname, "Fractmod", "Fractmod.html"))
    ipcMain.handleOnce("Fractmod:handle", () => {
        return new InstanceInfo({
            name: instance,
            path: path.join(fractaHome, "gameDirectory")
        })
    })
}
function tray() {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'asset', "image", 'mono 256 white.png'))
    const fracttray = new Tray(icon)
    fracttray.setTitle("Fractalium")
    fracttray.setToolTip('Fractalium')
    const contextmenu = Menu.buildFromTemplate([
        {
            label: "Close",
            type: "normal",
            click: () => {
                app.quit()
            },

        }
    ])
    fracttray.setContextMenu(contextmenu)
    return fracttray
}

module.exports = {
    getFractaHome
}