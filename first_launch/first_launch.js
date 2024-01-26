function bytes(bytes) {
    if (bytes < 1024) {
        return bytes + " Bytes";
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    } else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }
}
function bytesjava(bytes) {
    return (bytes / (1024 * 1024)).toFixed(0) + "M";
}

window.firstlaunch.install(async () => {
    const dialog = document.getElementById("dialog")
    await dialogChange("Do you have got minecraft ?", dialog)
    const yes = document.getElementById("yes")
    const no = document.getElementById("no")
    no.disabled = false
    yes.disabled = false
    const user = await new Promise((resolve, reject) => {
        no.addEventListener("click", async () => {
            no.disabled = true
            yes.disabled = true
            const name = await window.firstlaunch.auth()
            resolve(name)
        })
        yes.addEventListener("click", async () => {
            if (no.disabled) return
            no.disabled = true
            yes.disabled = true
            const name = await window.firstlaunch.auth("prenium")
            resolve(name)
        })
    })
    await dialogChange(`Hello ${user}`, dialog)
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 3000)
    })
    await dialogChange("Setup your Minecraft Ram !", dialog)
    const rammin = document.getElementById("rammin")
    const rammax = document.getElementById("rammax")
    const minram = document.getElementById("minram")
    const maxram = document.getElementById('maxram')
    rammin.classList.remove('on')
    rammax.classList.remove('on')
    minram.disabled = false
    maxram.disabled = false
    yes.textContent = "I am finisch"
    yes.disabled = false
    yes.addEventListener("click", async () => {
        window.firstlaunch.mcram({
            min: bytesjava(minram.value),
            max: bytesjava(maxram.value)
        })
        minram.disabled = true
        maxram.disabled = true
        yes.disabled = true
        rammin.classList.add('on')
        rammax.classList.add('on')
        await dialogChange("Configuration finisch ! : )", dialog)
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 5000)
        })
        window.firstlaunch.stop()
    })

})
document.addEventListener("DOMContentLoaded", async () => {
    const minram = document.getElementById("minram")
    const minramp = document.getElementById("minramp")
    const ram = await window.firstlaunch.ram()
    minram.max = ram
    minramp.textContent = bytes(minram.value)
    minram.title = `${minram.value} B`
    minram.addEventListener("change", () => {
        minramp.textContent = bytes(minram.value)
        minram.title = `${minram.value} B`
    })
    const maxram = document.getElementById("maxram")
    const maxramp = document.getElementById("maxramp")
    maxram.max = ram
    maxramp.textContent = bytes(maxram.value)
    maxram.title = `${maxram.value} B`
    maxram.addEventListener("change", () => {
        maxramp.textContent = bytes(maxram.value)
        maxram.title = `${maxram.value} B`

    })
})
function dialogChange(text, dialog) {
    return new Promise((resolve, reject) => {
        dialog.classList.add("on")
        setTimeout(() => {
            dialog.textContent = text
            dialog.classList.remove("on")
            resolve()
        }, 2000)
    })

}