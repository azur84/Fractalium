import React, { FC, useEffect, useRef } from "react"
import { Accounts } from "../account"

export const Accounts_menu: FC<{ visible: boolean, setVisible: (value: boolean) => void }> = ({ visible, setVisible }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setVisible]);

    return <div
        ref={menuRef}
        tabIndex={-1}
        style={{
            visibility: visible ? "visible" : "hidden",
        }}
        className="accounts_menu"
    >
        <Accounts></Accounts>
        <div>
            <button onClick={() => {
                window.launcher.account.openAccount()
            }}>{"Add an account"}</button>
        </div>
    </div>
}