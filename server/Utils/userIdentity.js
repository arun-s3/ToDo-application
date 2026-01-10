const getUserIdentity = (req) => {
    if (req.user) {
        return {
            isGuest: false,
            userId: req.user._id,
        };
    }

    return {
        isGuest: true,
        guestId: req.guestId,
    };
};

module.exports = getUserIdentity;
