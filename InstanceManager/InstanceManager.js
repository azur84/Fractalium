function addinstanceViewer(instance) {
    const instancelist = document.getElementById("instancelist")
    const instancediv = instancelist.appendChild(document.createElement("div"))
    instancediv.classList.add("instance")
    const title = instancediv.appendChild(document.createElement("h1"))
    title.innerHTML = instance.config.nickname || instance.name
    const logo = instancediv.appendChild(document.createElement("img"))
    logo.setAttribute("src", instance.config.icon || "../asset/image/mono 256 white.png")
    const modal = instancediv.appendChild(document.createElement("div"))
    const decription = modal.appendChild(document.createElement("p"))
    decription.innerHTML = instance.config.decription || instance.config.nickname || instance.name
    const launch = modal.appendChild(document.createElement("button"))
    launch.innerHTML = "launch"
    launch.addEventListener("click", () => {
        window.Instance.start(instance)
    })
    if (instance.config.version.includes("vanilla")) return
    const Fractmod = modal.appendChild(document.createElement("button"))
    Fractmod.innerHTML = "View in FractMod"
    Fractmod.addEventListener("click", () => {
        window.Fractmod.open(instance.name)
    })

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
            Object.keys(current).forEach((name) => {
                if (name == "installer") return
                if (!document.getElementById("snapshot").checked) {
                    try {
                        if (current[name].mcversion.type != "release") return
                    } catch (error) {
                        if (!(Object.keys(current[name]).some((v) => {
                            try {
                                return current[name][v].mcversion.type == "release"
                            } catch (error) {
                                return false
                            }
                        }))) return
                    }
                }
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
})