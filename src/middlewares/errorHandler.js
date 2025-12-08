const path = require("path");

function errorHandler(error, req, res, next) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    const statusCode = error.statusCode || error.status || 500;

    if (req.originalUrl.startsWith("/api") || req.headers.accept?.includes("application/json")) {
        return res.status(statusCode).json({
            error: error.message || 'Server error',
            success: false
        });
    }
    res.status(statusCode).sendFile(path.join(__dirname, '..', '..', 'public', 'errors', '500.html'));
}

module.exports = { errorHandler };