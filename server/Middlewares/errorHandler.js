
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message)

        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = isOperational

        Error.captureStackTrace(this, this.constructor)
    }
}

const errorHandler = (statusCode, message) => {
    return new AppError(statusCode, message);
};

module.exports = { errorHandler, AppError }
