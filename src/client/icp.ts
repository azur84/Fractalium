interface Window {
    launcher: {
        getInstances: () => Promise<Instance[]> | Promise<void>
        getInstance: (name: string) => Promise<Instance> | Promise<void>
        createInstance: (opt: Instance) => Promise<true | null>
        startInstance: (name: string, opt: Instance) => void
        account: {
            getAccount: () => Promise<Account>
            openAccount: () => Promise<any>
            setDefault: (id: string) => void
        }
    },
    app: {
        openDevTools: () => void
    }
}

interface Account {
    accounts: {
        offline: Record<string, string>,
        online: Record<string, any>
    }
    default: string
}

interface Instance {
    name: string
    description?: string
    mcversion: string
    mods?: Mod[]
    furnissor: Furnissor
    modsloader?: Modsloader
    mapping?: string[]
    options?: {},
    path?: string,
    icon?: string
}

interface Mod {
    filename: string
    displayName: string
    icon: string
    furnissor: Furnissor
}

interface Modsloader {
    name: string
    version: string
}

type Furnissor = "local" | "modrith"