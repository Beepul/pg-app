module.exports = (err, req, res, next) => {
    console.error("Error:", err.message);

    err.status = err.status || 500;
    err.message = err.message || "Internal server Error"

    res.status(err.status).json({
        result: err.data,
        message: err.message,
        meta: null,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    })
}