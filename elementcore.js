class DownloadButton {
    constructor(valid, content) {
        this.icon
        if (valid) {
            this.icon = "valid_icon"
        } else {
            this.icon = "download_icon"
        }
        this.button = document.createElement("button")
        this.button.classList.add(this.icon, "basic_button")
        this.content = this.button.appendChild(content)
    }
    updateValid(valid) {
        this.button.classList.remove(this.icon)
        if (valid) {
            this.icon = "valid_icon"
        } else {
            this.icon = "download_icon"
        }
        this.button.classList.add(this.icon)
    }
}
class Modal {
    constructor(icon, content) {
        // modal_container
        this.modal_container = document.createElement("div")
        this.modal_container.classList.add("modal_container")
        // modal_logo
        this.modal_logo = this.modal_container.appendChild(document.createElement("img"))
        this.modal_logo.classList.add("modal_logo")
        this.modal_logo.src = icon
        // modal_div
        this.modal_div = this.modal_container.appendChild(document.createElement("div"))
        this.modal_div.classList.add("modal_div")
        // modal_cache
        this.modal_cache = this.modal_div.appendChild(document.createElement("div"))
        this.modal_cache.classList.add("modal_cache")
        // modal_content
        this.modal_content = content
        if (this.modal_content) {
            this.modal_div.appendChild(content)
            content.classList.add("modal_content")
        }
    }
    add() {
        return this.modal_container
    }
    updatecontent(content = this.modal_content) {
        this.modal_content = content
        if (this.modal_content) {
            Array.from(this.modal_div.getElementsByClassName("modal_content")).forEach((e) => {
                e.remove()
            })
            this.modal_div.appendChild(content)
        }
    }
}
class Modal_Menu {
    constructor(title = "click") {
        this.modal_container = document.createElement("div")
        this.modal_container.classList.add("modal_menu")
        this.head_button = this.modal_container.appendChild(document.createElement("button"))
        this.head_button.textContent = title
        this.head_button.addEventListener("click", () => {
            this.modal_container.setAttribute("active", "")
        })
        this.modal_container.addEventListener("mouseleave", () => {
            this.modal_container.removeAttribute("active")
        })
        this.modal_div = this.modal_container.appendChild(document.createElement("div"))
        this.modal_div.classList.add("modal_menu_content")
        this.modal_buttons = []
    }
    add() {
        return this.modal_container
    }
    addButton(name = "button", ligne = false, clickevent) {
        const button = this.modal_div.appendChild(document.createElement('button'))
        button.textContent = name
        this.modal_buttons.push(button)
        if (!ligne) this.modal_div.appendChild(document.createElement("br"))
        if (clickevent) button.addEventListener("click", clickevent)
        return button
    }
}