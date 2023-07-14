exports.statusFunc = (res, status, message) => {
    return res.status(status).json({
        status: status < 210 ? "success" : "failed",
        message
    })
}

exports.statusFuncLength = (res, status, message) => {
    return res.status(status).json({
        status: status > 210 ? "success" : "failed",
        length: message.length,
        message
    })
}

