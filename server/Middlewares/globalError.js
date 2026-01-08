const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

    console.error("ERROR:", {
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack,
    })

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message || "Something went wrong",
    });
}

module.exports = globalErrorHandler
