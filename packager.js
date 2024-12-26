const webpack = require('webpack');
const { exec } = require('child_process');
const webpackconfig = require("./webpack.config")
const builder = require("electron-builder")
require("dotenv").config()

const platform = builder.Platform

const webpackprom = new Promise((resolve, reject) => {
    webpack(webpackconfig).run((e) => {
        if (e) reject(e)
        resolve()
    })
})

const viteprom = new Promise((resolve, reject) => {
    exec("yarn run vite build --mode production", (e, out, err) => {
        if (e) reject()
        resolve()
    })
})

Promise.all([webpackprom, viteprom]).then(() => {
    builder.build({
        targets: platform.WINDOWS.createTarget(),
        config: {
            compression: "maximum",
            files: [
                {
                    from: "out/",
                    to: "",
                    filter: ["**/*"]
                },
                "package.json"
            ],
            // extraResources: [
            //     {
            //         from: "./extra_resource/*",
            //         to: "resources"
            //     },
            // ],
            win: {
                target: "portable",
                icon: "src/client/assets/images/logo/fractalium.ico",
                cscLink: "./cert.pfx",
                cscKeyPassword: process.env.csspassword
            }
        }
    }).then((v) => {
        console.log("Success to build app. ")
    }).catch((err) => console.error(`Error with electron-builder ${err}`))
}).catch((err) => console.error(`Error with packers. ${err}`))