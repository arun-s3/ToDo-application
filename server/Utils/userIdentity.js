
const getUserIdentity = (req) => {
    if (req.user) {
        console.log("req.user._id inside getUserIdentity()----->", req.user._id)
        return {
            isGuest: false,
            userId: req.user._id,
            guestId: null
        }
    }

    console.log("req.guestId inside getUserIdentity()----->", req.guestId)

    return {
        isGuest: true,
        guestId: req.guestId,
        userId: null
    }
}

module.exports = getUserIdentity;
