function applister() {
    const div = document.getElementById("applist")
    div.innerHTML = ""
    // Intances
    const intancediv = document.createElement("div")
    const intancetitle = intancediv.appendChild(document.createElement("h1"))
    intancetitle.textContent = "Instance"
    const intancecontent = intancediv.appendChild(document.createElement("p"))
    intancecontent.textContent = "Manage and Launch Intance"
    const intance = new Modal("./asset/image/mono 256 white.png", intancediv)
    intance.modal_logo.addEventListener("click", () => {
        document.location.assign("./InstanceManager/InstanceManager.html")
    })
    div.appendChild(intance.add())
    // Config
    const configdiv = document.createElement("div")
    const configtitle = configdiv.appendChild(document.createElement("h1"))
    configtitle.textContent = "Config"
    const configcontent = configdiv.appendChild(document.createElement("p"))
    configcontent.textContent = "Configuration of Fractalium"
    const configbutton = new Modal("./asset/image/flywheel-256.png", configdiv)
    configbutton.modal_logo.addEventListener("click",() => {
        window.open("./config/config.html")
    })
    div.appendChild(configbutton.add())
    // Add
    const adddiv = document.createElement("div")
    const addtitle = adddiv.appendChild(document.createElement("h1"))
    addtitle.textContent = "Add"
    const addcontent = adddiv.appendChild(document.createElement("p"))
    addcontent.textContent = "Add application to Fractalium"
    const addbutton = new Modal("./asset/image/add-256.png", adddiv)
    div.appendChild(addbutton.add())
}
document.addEventListener("DOMContentLoaded", () => {
    applister()
})