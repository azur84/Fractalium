var index = 0
var activ = false
var lasted = undefined
var indexfile = 0
var instance

var instancePro = new Promise(async (resolve, reject) => {
    try {
        const instances = await window.Fractmod.getcurrentInstance()
        resolve(instances)
    } catch (error) {
        throw error
    }
})
instancePro.then((e) => {
    instance = e
})

const apikey = window.Api.curse
const curseModloader = {
    any: 0,
    forge: 1,
    cauldron: 2,
    liteloader: 3,
    fabric: 4,
    quilt: 5,
    neoforge: 6
}


function getVersionObject(version) {
    const list = version.split("-")
    return {
        modloader: list[0],
        mcversion: list[1],
        modloaderversion: list[2]
    }
}
async function dependencies(dependencies) {
    dependencies.forEach(async (e) => {
        switch (e.relationType) {
            case 3:
                try {
                    const instanceversion = getVersionObject(instance.config.version)
                    const link = `v1/mods/${e.modId}/files?modLoaderType=${curseModloader[instanceversion.modloader]}&gameVersion=${instanceversion.mcversion}`
                    curce(link).then((files) => {
                        const f = files.data[0]
                        if (instance.mods.some((m) => f.fileName == m.name)) return
                        window.Fractmod.downloadMod(f, instance).then((mm) => {
                            instance.mods.push(mm.mod)
                            const but = document.getElementById(`fastdown${e.modId}`)
                            if (but) {
                                but.disabled = true
                            }

                        })
                    })
                } catch (error) {
                    window.open(e.downloadUrl)
                }
                break
            default:
                break
        }
    })
}
async function search(option) {
    let load = document.getElementById("loading")
    load.classList.remove("hidden")
    return new Promise((resolve, reject) => {
        let url = "https://api.curseforge.com/v1/mods/search?"
        Object.keys(option).forEach((e) => {
            url = url + `${e}=${option[e]}&`
        })
        url = url.slice(0, -1)
        const headers = {
            "Accept": "application/json",
            "x-api-key": apikey,
        };

        fetch(url, {
            method: "GET",

            headers: headers,
        })
            .then(function (res) {
                return res.json();
            },
                (e) => {
                    load.textContent = ""
                    reject(e)
                })
            .then(function (body) {
                load.classList.add("hidden")
                resolve(body)
            });
    })
}
function fileType(type) {
    switch (type) {
        case 1:
            return { icon: "../asset/image/mod files/release.png", name: "release" }

        case 2:
            return { icon: "../asset/image/mod files/beta.png", name: "beta" }

        case 3:
            return { icon: "../asset/image/mod files/alpha.png", name: "alpha" }

        default:
            return undefined
    }
}
function getModLoader(modloader) {
    switch (modloader) {
        case "Forge":
            return { icon: "../asset/image/modloader/forge.jpg", name: "forge" }

        case "Fabric":
            return { icon: "../asset/image/modloader/fabric.png", name: "fabric" }

        case "NeoForge":
            return { icon: "../asset/image/modloader/neoforge.png", name: "neoforge" }

        case "Quilt":
            return { icon: "../asset/image/modloader/quilt.png", name: "quilt" }

        default:
            return { icon: "../asset/image/mono 256 white.png", name: `${modloader}` }
    }
}
function octets(quantiteOctets) {
    if (quantiteOctets < 1024) {
        return quantiteOctets + " octets";
    } else if (quantiteOctets < 1024 * 1024) {
        return (quantiteOctets / 1024).toFixed(2) + " Ko";
    } else if (quantiteOctets < 1024 * 1024 * 1024) {
        return (quantiteOctets / (1024 * 1024)).toFixed(2) + " Mo";
    } else {
        return (quantiteOctets / (1024 * 1024 * 1024)).toFixed(2) + " Go";
    }
}
function downloadcost(downloadcost) {
    if (downloadcost < 1000) {
        return downloadcost;
    } else if (downloadcost < 1000 * 1000) {
        return (downloadcost / 1000).toFixed(2) + " K";
    } else if (downloadcost < 1000 * 1000 * 1000) {
        return (downloadcost / (1000 * 1000)).toFixed(2) + " M";
    }
}
async function curce(lien) {
    let load = document.getElementById("loading")
    load.classList.remove("hidden")
    return new Promise((resolve, reject) => {
        const headers = {
            "Accept": "application/json",
            "x-api-key": apikey,
        };

        fetch(`https://api.curseforge.com/${lien}`, {
            method: "GET",

            headers: headers,
        })
            .then(function (res) {
                return res.json();
            },
                (e) => {
                    reject(e)
                })
            .then(function (body) {
                load.classList.add("hidden")
                resolve(body)
            });
    })
}
async function modal(e) {
    const mod = e
    let moda = document.getElementById("modmodal")
    document.body.classList.add("over")
    let logo = moda.querySelector("img")
    if (e.logo == undefined) {
        logo.setAttribute("src", "../asset/image/mono 256 white.png")
    } else {
        logo.setAttribute("src", e.logo.thumbnailUrl)
    }
    moda.addEventListener("close", () => {
        document.body.classList.remove("over")
        moda.classList.add("trans")
    })
    const ongletfunction = {
        description: async function description(e) {
            let des = document.getElementById("des")
            const reply = await curce(`v1/mods/${e.id}/description`)
            des.innerHTML = reply.data
            Array.from(des.querySelectorAll("img")).forEach(e => {
                if (e.hasAttribute("width")) {
                    e.setAttribute("width", Math.round(e.getAttribute("width") * 0.8))
                }
                if (e.hasAttribute("height")) {
                    e.setAttribute("height", Math.round(e.getAttribute("height") * 0.8))
                }
            })
            Array.from(des.querySelectorAll("[href]")).forEach(e => {
                if (e.getAttribute("href").includes("https://www.curseforge.com/minecraft/mc-mods/")) {
                    const slug = e.getAttribute("href").split("/")[5]
                    e.title = slug
                    e.removeAttribute("href")
                    e.addEventListener("click", async () => {
                        moda.close()
                        const arg = {
                            gameId: 432,
                            index: 0,
                            classId: 6,
                            slug: slug,
                        }
                        const sear = await search(arg)
                        const data = sear.data[0]
                        modal(data)
                    })
                } else if (e.getAttribute("href").includes("/linkout?remoteUrl=")) {
                    e.setAttribute("href", e.getAttribute("href").replace("/linkout?remoteUrl=", "").replace("%253a", ":").replaceAll("%252f", "/"))

                }
            })
            Array.from(des.querySelectorAll("a")).forEach((e) => {
                if (!e.hasAttribute("href")) return
                e.setAttribute("target", "_blank")
            })
        },
        files: async function files(e) {
            let lastfile
            let des = document.getElementById("des")
            des.innerHTML = ""
            indexfile = 0
            let table = des.appendChild(document.createElement("table"))
            let entete = table.appendChild(document.createElement("tr"))
            entete.classList.add("entete")
            entete.innerHTML = '<th scope="col" class="typefile">Type</th><th scope="col">Name</th><th scope="col">Date</th><th scope="col" class="typefile">Size</th><th scope="col">minecraft<br>version</th><th scope="col">modloader</th><th scope="col">install count</th><th scope="col">install</th>'
            await writefilesmod(e, table, 0)
            async function writefilesmod(e, table, index) {
                const filess = await curce(`v1/mods/${e.id}/files?index=${index}`)
                lastfile = filess
                filess.data.forEach((e) => {
                    let ligne = table.appendChild(document.createElement("tr"))
                    ligne.classList.add("file")
                    // TYPE
                    let type = ligne.appendChild(document.createElement("td"))
                    type.classList.add("typefile")
                    type.title = fileType(e.releaseType).name
                    // ICON
                    let icon = type.appendChild(document.createElement("img"))
                    icon.classList.add("fileicon")
                    icon.setAttribute("src", fileType(e.releaseType).icon)
                    // NAME
                    let name = ligne.appendChild(document.createElement("td"))
                    if (e.displayName.length > 35) {
                        name.textContent = e.displayName.slice(0, 32) + "..."
                        name.title = e.displayName
                    } else {
                        name.textContent = e.displayName
                    }
                    // DATE
                    let date = ligne.appendChild(document.createElement("td"))
                    date.textContent = new Date(e.fileDate).toLocaleString('en', { timeZone: 'UTC' })
                    // SIZE
                    let size = ligne.appendChild(document.createElement("td"))
                    size.textContent = octets(e.fileLength)
                    size.title = e.fileLength + "o"
                    // Minecraft Version
                    let mcloader = ligne.appendChild(document.createElement("td"))
                    mcloader.classList.add("gameversion")
                    e.gameVersions.filter((wo) => wo.includes(".")).forEach((e) => {
                        mcloader.textContent = mcloader.textContent + e + " "
                    })
                    // Modloader
                    let modloader = ligne.appendChild(document.createElement("td"))
                    e.gameVersions.filter((wo) => !wo.includes(".")).forEach((e) => {
                        let mllogo = modloader.appendChild(document.createElement("img"))
                        mllogo.classList.add("mllogo")
                        mllogo.setAttribute("src", getModLoader(e).icon)
                        mllogo.title = getModLoader(e).name
                    })
                    // downloadcost
                    let downloadcosttd = ligne.appendChild(document.createElement("td"))
                    downloadcosttd.textContent = downloadcost(e.downloadCount)
                    downloadcosttd.title = e.downloadCount
                    // download
                    let download = ligne.appendChild(document.createElement("td"))
                    download.classList.add("download")
                    let downloadbut = download.appendChild(document.createElement("button"))
                    downloadbut.classList.add("downloadbut")
                    downloadbut.title = 'Download this version'
                    downloadbut.id = `downloadbutton${e.fileName}`
                    downloadbut.disabled = instance.mods.some((m) => e.fileName == m.name)
                    if (downloadbut.disabled) downloadbut.title = 'Version downloaded'
                    downloadbut.addEventListener("click", () => {
                        if (instance.mods.some((m) => e.fileName == m.name)) return
                        try {
                            window.Fractmod.downloadMod(e, instance).then((mm) => {
                                dependencies(e.dependencies)
                                instance.mods.push(mm.mod)
                                downloadbut.disabled = true
                                downloadbut.title = 'version downloaded'
                                mm.remove.forEach((u) => {
                                    instance.mods.splice(instance.mods.findIndex((p) => u.name == p.name), 1)
                                    const button = document.getElementById(`downloadbutton${u.name}`)
                                    button.disabled = false
                                    button.title = 'Download this version'
                                })
                            })
                        } catch (error) {
                            window.open(e.downloadUrl)
                        }
                    })
                })
            }
            if (document.getElementsByClassName("morefile")[0] != undefined) {
                document.getElementsByClassName("morefile")[0].remove()
            }
            if (lastfile.pagination.totalCount > 50) {
                let more = des.appendChild(document.createElement("button"))
                more.classList.add("morefile")
                more.textContent = "+ more files"
                more.addEventListener("click", () => {
                    indexfile = indexfile + 50
                    writefilesmod(e, table, indexfile)
                    if (indexfile + 50 > lastfile.pagination.totalCount) {
                        more.remove()
                    }
                })
            }
        }
    }
    const ongletdiv = document.getElementById("onglet").querySelectorAll("button")
    Array.from(ongletdiv).forEach(async (e) => {
        e.addEventListener("click", (event) => {
            Array.from(ongletdiv).forEach((e) => e.disabled = false)
            e.disabled = true
            ongletfunction[e.id](mod)
        })

    })
    const but = document.getElementById("onglet").querySelector("button")
    Array.from(ongletdiv).forEach((e) => e.disabled = false)
    but.disabled = true
    await ongletfunction[but.id](mod)
    moda.showModal()
    moda.classList.remove("trans")
}

async function allMod(arg) {

    if (activ) { return }
    activ = true
    await search(arg).then(
        async (rep) => {
            const modlist = document.getElementById("mod")
            await rep.data.forEach(e => {
                //div
                let mod = modlist.appendChild(document.createElement("div"))
                mod.setAttribute("class", "moddiv load")
                //modal
                let modall = mod.appendChild(document.createElement("div"))
                modall.setAttribute("class", "modal")
                //cachemodal
                let cache = modall.appendChild(document.createElement("div"))
                cache.setAttribute("class", "cacheModal")
                //title
                let title = modall.appendChild(document.createElement("h2"))
                title.setAttribute("class", "modtitle")
                title.textContent = e.name.replace(/\//g, '/\u200b').replace(/\(/g, "\u200b(").replace(/\[/g, "\u200b[").replace(/\&/g, "\u200b&")
                //summary
                let summary = modall.appendChild(document.createElement("p"))
                summary.setAttribute("class", "summaryMod")
                summary.textContent = e.summary.replace(/\//g, '/\u200b').replace(/\(/g, "\u200b(").replace(/\[/g, "\u200b[").replace(/\&/g, "\u200b&")
                //download
                let download = modall.appendChild(document.createElement("p"))
                download.setAttribute("class", "downloadMod")
                download.textContent = `${downloadcost(e.downloadCount)} download`
                //logo
                let img = mod.appendChild(document.createElement("img"))
                img.setAttribute("class", "logo")
                if (e.logo == undefined) {
                    img.setAttribute("src", "../asset/image/mono 256 white.png")
                } else {
                    img.setAttribute("src", e.logo.thumbnailUrl)
                }
                img.addEventListener("load", (e) => {
                    mod.classList.remove("load")
                }, { once: true })
                setTimeout(img.addEventListener("click", (event) => modal(e)), 100)
                lasted = rep
                //downloadbutton
                let button = modall.appendChild(document.createElement("button"))
                button.classList.add("downloadbut")
                button.id = `fastdown${e.id}`
                let releasefile
                const instanceversion = getVersionObject(instance.config.version)
                const link = `v1/mods/${e.id}/files?modLoaderType=${curseModloader[instanceversion.modloader]}&gameVersion=${instanceversion.mcversion}`
                curce(link).then((files) => {
                    releasefile = files.data[0]
                    button.disabled = instance.mods.some((m) => releasefile.fileName == m.name)
                    if (button.disabled) {
                        button.textContent = ' Downloaded'
                    } else {
                        button.textContent = ' Download now'
                    }
                })
                button.addEventListener("click", async () => {
                    window.Fractmod.downloadMod(releasefile, instance).then((mm) => {
                        dependencies(releasefile.dependencies)
                        instance.mods.push(mm.mod)
                        button.disabled = true
                        button.textContent = ' Downloaded'
                        mm.remove.forEach((u) => {
                            instance.mods.splice(instance.mods.findIndex((p) => u.name == p.name), 1)
                        })
                    }
                    )
                })
            })

        }, (e) => {

        })
    activ = false
}
document.addEventListener("DOMContentLoaded", async () => {
    function input() {
        const modlist = document.getElementById("mod")
        modlist.textContent = ""
        index = 0
        lasted = undefined
        const version = getVersionObject(instance.config.version)
        const arg = {
            gameId: 432,
            index: 0,
            classId: 6,
            sortField: 2,
            sortOrder: "desc",
            searchFilter: document.getElementById("modsearch").value,
            gameVersion: version.mcversion,
            modLoaderType: version.modloader
        }
        allMod(arg)
    }
    document.getElementById("search").addEventListener("click", input)
    document.getElementById("modsearch").addEventListener("keyup", (e) => {
        if (e.key == "Enter") {
            input()
        }

    })
    document.addEventListener("scroll", (e) => {
        if ((window.innerHeight + window.scrollY + 500) >= document.body.offsetHeight) {
            if (activ) { return }
            if (index + 50 > lasted.pagination.totalCount) {
                return
            }
            const version = getVersionObject(instance.config.version)
            const arg = {
                gameId: 432,
                index: index + 50,
                classId: 6,
                sortField: 2,
                sortOrder: "desc",
                searchFilter: document.getElementById("modsearch").value,
                gameVersion: version.mcversion,
                modLoaderType: version.modloader
            }
            index = index + 50
            allMod(arg)
        }
    })
    index = 0
    instancePro.then((e) => {
        const version = getVersionObject(e.config.version)
        const argdefaut = {
            gameId: 432,
            index: 0,
            classId: 6,
            sortField: 2,
            sortOrder: "desc",
            searchFilter: document.getElementById("modsearch").value,
            gameVersion: version.mcversion,
            modLoaderType: version.modloader
        }
        allMod(argdefaut)
    })
})