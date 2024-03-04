const axios = require('axios');
const { version } = require("./package.json");
const { dialog, BrowserWindow, app } = require('electron');
const { download } = require('./launchercore');

async function check() {
    try {
        const json = await axios({
            method: "get",
            url: "https://azur84.github.io/fractalium/update.json",
            responseType: 'json',
            
        })
        const newver = json.data.version
        if (version != newver) {
            const reply = await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
                message: "New Version is available",
                buttons: ["Later", "Download now"],
            })
            if (reply.response !== 1) return
            const link = json.data.file
            const path = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
                filters: [{
                    extensions: ["zip"],
                    name: "new fractalium version"
                }]
            })
            if (path.canceled) return
            await download(link, path.filePath)
        }
        return
    } catch (error) {
        return
    }

}

module.exports = {
    check
}