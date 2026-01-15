import React, { useEffect } from "react"


export default function useModalClose(modalRef, onClose, enabled = true, traceClickOutside = true) {

    useEffect(() => {
        if (!enabled) return

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose()
            }
        }

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        if (traceClickOutside) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [modalRef, onClose, enabled])

}
