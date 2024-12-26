/// <reference types="vite/client"/>
/// <reference types="vite-plugin-svgr/client"/>
import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom"
import { InstanceMainMenu } from "./components/main_windows/instance"
import { InstancesSideMenu } from "./components/side_menus/instances"
import { InstanceCreationEnd, ModloaderQuestionnaire, ModloaderVersionQuestionnaire, VanillaVersionQuestionnaire } from "./components/main_windows/instances/creation"
import "./css/index.css"
import { HotBar } from "./components/hotbar"
import "./icp"
import { InstanceSideMenu } from "./components/side_menus/instance"

window.addEventListener("keypress", (ev) => {
    if (ev.ctrlKey && ev.shiftKey && ev.code === "KeyI") {
        window.app.openDevTools()
    }
    if (ev.ctrlKey && ev.code === "KeyR") {
        document.location.reload()
    }
})

const mainmenuroot = createRoot(document.getElementById("app_container")!)
mainmenuroot.render(<StrictMode>
    <BrowserRouter>
        <div id="side_menu">
            <Routes>
                <Route path="/*" element={<InstancesSideMenu />}></Route>
                <Route path="instance/:name/:page/*" element={<InstanceSideMenu />} />
            </Routes>
        </div>
        <div id="view">
            <Routes>
                <Route path="instances">
                    <Route path="create" element={<ModloaderQuestionnaire />} />
                    <Route path="create/:modloader" element={<VanillaVersionQuestionnaire />} />
                    <Route path="create/:modloader/:mcversion" element={<ModloaderVersionQuestionnaire />} />
                    <Route path="create/:modloader/:mcversion/:modversion" element={<InstanceCreationEnd />} />
                </Route>
                <Route path="/" element={<Outlet />} />
                <Route path="instance/:name/:page" element={<InstanceMainMenu />}></Route>
            </Routes>
        </div>
    </BrowserRouter>
</StrictMode>)

const hotbarroot = createRoot(document.getElementById("app_bar")!)
hotbarroot.render(<StrictMode>
    <HotBar />
</StrictMode>)
