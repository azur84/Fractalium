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
        window.instance.start(instance)
    })

}
function setVersion() {
    return new Promise(async (resolve, reject) => {
        const version = await window.instance.getVersions()
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
            Object.keys(current).forEach((name) => {
                if (name == "installer") return
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
    return string = string.match(regexp)
}

function reloadModPack() {
    const instancelist = document.getElementById("instancelist")
    window.instance.getinstance().then((e) => {
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
    const chooseversion = document.querySelector("button")//getElementById("chooseversion")
    chooseversion.addEventListener("click", async () => {
        chooseversion.disabled = true
        await setVersion().then((e) => {
            chooseversion.innerText = `current version : ${e}`
            chooseversion.disabled = false
        }, (err) => {
            chooseversion.disabled = false
        })
    })
    document.getElementById("changeicon").addEventListener("click", async (e) => {
        const icon = await window.tool.getFile("iconMod")
        document.getElementById("changeicon").setAttribute("src", icon)
    })
    document.getElementById("name")
})