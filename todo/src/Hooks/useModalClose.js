import { useEffect } from "react"


export default function useModalClose(modalRef, onClose, enabled = true, traceClickOutside = true) {

    useEffect(() => {
        if (!enabled) return

        const handlePointerDown = (e) => {
            if (!modalRef.current) return
            if (!modalRef.current.contains(e.target)) {
                onClose()
            }
        }

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault()
                onClose()
            }
        }

        if (traceClickOutside) {
            window.addEventListener("pointerdown", handlePointerDown)
        }
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            if (traceClickOutside) {
                window.removeEventListener("pointerdown", handlePointerDown)
            }
            window.removeEventListener("keydown", handleKeyDown)
        }
        
    }, [modalRef, onClose, enabled, traceClickOutside])
}
