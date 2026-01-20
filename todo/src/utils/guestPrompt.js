
export const shouldShowGuestSignupModal = () => {
    const key = "guestSignupPromptLastShown"
    const last = localStorage.getItem(key)

    if (!last) return true

    const lastTime = Number(last)
    const now = Date.now()

    const GUEST_NUDGE_INTERVAL = 1000 * 60 * 60 * 12

    return now - lastTime > GUEST_NUDGE_INTERVAL
}
