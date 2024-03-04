window.addEventListener('DOMContentLoaded', async () => {
    //#region keeplaunch
    const keeplaunch = document.getElementById("keeplaunch")
    keeplaunch.addEventListener("change", () => {
        window.Config.changeKeepLaunch(keeplaunch.checked)
    })
    //#endregion keeplaunch 
    //#region ram
    const ram = await window.Config.getram()
    const minram = document.getElementById("minram")
    const maxram = document.getElementById("maxram")
    const minraminput = document.getElementById("minraminput")
    const maxraminput = document.getElementById("maxraminput")
    const saveram = document.getElementById("saveram")
    // min
    minram.max = ram.maxram
    minram.value = textToBytes(ram.configram.min)
    minram.addEventListener("change", () => {
        minraminput.value = bytes(minram.value)
        saveram.disabled = false
    })
    // max
    maxram.max = ram.maxram
    maxram.value = textToBytes(ram.configram.max)
    maxram.addEventListener("change", () => {
        maxraminput.value = bytes(maxram.value)
        saveram.disabled = false
    })
    // min input
    minraminput.value = ram.configram.min
    minraminput.addEventListener("change", () => {
        minram.value = textToBytes(minraminput.value)
        saveram.disabled = false
    })
    //max input
    maxraminput.value = ram.configram.max
    maxraminput.addEventListener("change", () => {
        maxram.value = textToBytes(maxraminput.value)
        saveram.disabled = false
    })
    //save
    saveram.addEventListener("click", () => {
        const rams = {
            min: bytesjava(minram.value),
            max: bytesjava(maxram.value)
        }
        window.Config.setRam(rams)
        saveram.disabled = true
    })
    //#endregion ram
    //#region auth
    const authxbox = document.getElementById('authxbox')
    const authnickname = document.getElementById("authnickname")
    authxbox.addEventListener("click", () => {
        window.Config.auth("mc")
    })
    authnickname.addEventListener("click", () => {
        window.Config.auth("offline")
    })
})

function textToBytes(text) {
    if (text.includes("KB") || text.includes("K")) {
        return text.match(/[0-9.]*/)?.[0] * 1024
    } else if (text.includes("MB") || text.includes("M")) {
        return text.match(/[0-9.]*/)?.[0] * 1024 * 1024
    } else if (text.includes("GB") || text.includes("G")) {
        return text.match(/[0-9.]*/)?.[0] * 1024 * 1024 * 1024
    } else {
        return text.match(/[0-9.]*/)?.[0] || 0
    }
}

function bytes(bytes) {
    if (bytes < 1024) {
        return bytes + "";
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + "K";
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + "M";
    } else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + "G";
    }
}

function bytesjava(bytes) {
    return (bytes / (1024 * 1024)).toFixed(0) + "M";
}