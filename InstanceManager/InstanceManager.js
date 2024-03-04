function addinstanceViewer(instance) {
    const instancelist = document.getElementById("instancelist")
    const modal = document.createElement("div")
    // title
    const title = modal.appendChild(document.createElement("h1"))
    title.innerHTML = instance.config.nickname || instance.name
    // decription
    const decription = modal.appendChild(document.createElement("p"))
    decription.innerHTML = instance.config.decription || instance.config.nickname || instance.name
    // Launch
    const launch = modal.appendChild(document.createElement("button"))
    launch.classList.add("basic_button")
    launch.innerHTML = "launch"
    launch.addEventListener("click", () => {
        window.Instance.start(instance)
    })
    // openfolder
    const openfolder = modal.appendChild(document.createElement("button"))
    openfolder.classList.add("basic_button")
    openfolder.innerHTML = "open in folder"
    openfolder.addEventListener("click", () => {
        window.Instance.openfolder(instance)
    })
    // Fractmod
    if (!instance.config.version.includes("vanilla")) {
        const fractmod = modal.appendChild(document.createElement("button"))
        fractmod.classList.add("basic_button")
        fractmod.innerHTML = "View in FractMod"
        fractmod.addEventListener("click", () => {
            window.Fractmod.open(instance.name)
        })
    }
    // Delete
    const deletebutton = modal.appendChild(document.createElement("button"))
    deletebutton.classList.add("basic_button")
    deletebutton.innerHTML = "Delete"
    deletebutton.addEventListener("click", async () => {
        const re = await window.Instance.delete(instance)
        if (re) {
            document.location.reload()
        }
    })
    // Modal
    const icon = instance.config.icon || "../asset/image/mono 256 white.png"
    const newmodal = new Modal(icon, modal)
    newmodal.modal_logo.addEventListener("click", () => {
        showIntanceDialog(instance)
    })
    instancelist.appendChild(newmodal.add())
}
function setVersion() {
    return new Promise(async (resolve, reject) => {
        await versionspro
        let snap
        const version = versions
        const dialog = document.getElementById("chooseversion")
        const allversion = document.getElementById("allversion")
        allversion.innerHTML = ""
        function setVis(vis = "") {
            const split = vis.split("-")
            let current = version
            split.forEach((e) => {
                current = current[e]
            })
            allversion.innerHTML = ""
            try {
                document.getElementById("snapshot").removeEventListener("change", snap)
            } catch (error) { }
            snap = () => {
                setVis(vis)
            }
            document.getElementById("snapshot").addEventListener("change", snap)
            Object.keys(current).filter((name) => {
                if (name == "installer") return false
                if (!document.getElementById("snapshot").checked) {
                    try {
                        if (current[name].mcversion.type != "release") return false
                    } catch (error) {
                        if (!(Object.keys(current[name]).some((v) => {
                            try {
                                return current[name][v].mcversion.type == "release"
                            } catch (error) {
                                return false
                            }
                        }))) return false
                    }
                }
                return true
            }).forEach((name) => {
                const button = allversion.appendChild(document.createElement("button"))
                button.innerText = name
                button.addEventListener("click", () => {
                    if (current[name].method) {
                        dialog.close()
                        resolve(`${vis}-${name}`)
                    } else {
                        setVis(`${vis}-${name}`)
                    }

                }, { once: true })
            })
        }
        Object.keys(version).forEach((name) => {
            const button = allversion.appendChild(document.createElement("button"))
            button.innerText = name
            button.addEventListener("click", () => {
                setVis(`${name}`)
            }, { once: true })
        })
        dialog.showModal()
        dialog.addEventListener("close", (e) => {
            reject("cancel")
        })

    })
}
function showIntanceDialog(instance) {
    const modal = document.getElementById("instance_dialog")
    const logo = document.getElementById("dialog_logo")
    logo.src = instance.config.icon || "../asset/image/mono 256 white.png"
    const title = document.getElementById("instance_dialog_title")
    title.textContent = instance.config.nickname || instance.name
    const modtable = document.getElementById("mod_list")
    modtable.innerHTML = ""
    const trth = document.createElement("tr")
    const thicon = trth.appendChild(document.createElement("th"))
    const thpicon = thicon.appendChild(document.createElement("p"))
    thpicon.textContent = "Icon"
    const thname = trth.appendChild(document.createElement("th"))
    const thpname = thname.appendChild(document.createElement("p"))
    thpname.textContent = "File name"
    const thaction = trth.appendChild(document.createElement("th"))
    const thpaction = thaction.appendChild(document.createElement("p"))
    thpaction.textContent = "Action"
    modtable.appendChild(trth)
    const mods = instance.mods.forEach(async (e, index) => {
        const icon = await window.Instance.getModIcon(e.path)
        const tr = document.createElement("tr")
        const tdlogo = tr.appendChild(document.createElement("td"))
        const logo = tdlogo.appendChild(document.createElement("img"))
        logo.src = icon
        logo.classList.add("mods_icon")
        const tdname = tr.appendChild(document.createElement("td"))
        const name = tdname.appendChild(document.createElement("p"))
        name.textContent = e.name
        //#region action
        const tdaction = tr.appendChild(document.createElement('td'))
        const actionmenu = new Modal_Menu("action")
        // actionmenu.addButton("enabled")
        // actionmenu.addButton("disabled")
        actionmenu.addButton("delete", undefined, () => {
            window.Instance.deleteMod(e.path).then((e) => {
                if (!e) return
                instance.mods.splice(index, 1)
                tr.remove()
            })
        })
        tdaction.appendChild(actionmenu.add())
        //#endregion action
        modtable.appendChild(tr)
    })
    modal.showModal()
}

function wvalid(string, regexp) {
    return string == string.match(regexp)
}
let versions
const versionspro = window.Instance.getVersions()
versionspro.then((e) => {
    versions = e
})

function reloadModPack() {
    const instancelist = document.getElementById("instancelist")
    window.Instance.getinstance().then((e) => {
        instancelist.querySelectorAll("div").forEach((el) => {
            if (!el.id == "add") {
                el.remove()
            }
        })
        e.forEach((ele) => {
            addinstanceViewer(ele)
        })
    })
}

document.addEventListener("DOMContentLoaded", (e) => {
    document.getElementById("addmodpack").addEventListener("click", (ev) => {
        document.getElementById("addmodpackmodal").showModal()
    })
    reloadModPack()
    const chooseversion = document.getElementById("chooseversionbut")
    chooseversion.addEventListener("click", async () => {
        chooseversion.disabled = true
        await setVersion().then((e) => {
            chooseversion.innerText = `current version : ${e}`
            chooseversion.setAttribute("intanceversion", e)
            chooseversion.disabled = false
        }, (err) => {
            chooseversion.disabled = false
        })
    })
    document.getElementById("changeicon").addEventListener("click", async (e) => {
        const icon = await window.tool.getFile("iconMod")
        document.getElementById("changeicon").setAttribute("src", icon)
    })
    document.getElementById("createinstance").addEventListener("click", () => {
        if (!(document.getElementById("chooseversionbut").getAttribute("intanceversion"))) return
        const name = document.getElementById("name").value
        if (!wvalid(name, /\w+/)) return
        const parm = {
            name: name,
            nickname: document.getElementById("nickname").value,
            decription: document.getElementById("decription").value,
            version: document.getElementById("chooseversionbut").getAttribute("intanceversion"),
            icon: document.getElementById("changeicon").getAttribute("src")
        }
        document.getElementById("addmodpackmodal").close()
        window.Instance.newInstance(parm)
        document.location.reload()
    })
    document.getElementById("import").addEventListener("click", () => {
        document.getElementById("import_modal").showModal()
    })
    document.getElementById("importfile").addEventListener("click", async () => {
        const rep = await window.Instance.import("file")
        if (rep) document.location.reload()
    })
})