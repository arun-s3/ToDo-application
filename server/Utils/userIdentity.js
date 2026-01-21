
const getUserIdentity = (req) => {
    if (req.user) {
        return {
            isGuest: false,
            userId: req.user._id,
            guestId: null
        }
    }

    return {
        isGuest: true,
        guestId: req.guestId,
        userId: null
    }
}

module.exports = getUserIdentity;
