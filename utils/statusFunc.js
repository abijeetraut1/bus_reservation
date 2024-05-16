exports.statusFunc = (res, status, message) => {
    return res.status(status).json({
        status: status >= 203 ? "Failed" : "Success",
        message
    })
}

exports.statusFuncLength = (res, status, message) => {
    return res.status(status).json({
        status: status > 400 ? "Failed" : "Success",
        length: message.length,
        message
    })
}

exports.statusFuncWithRender = (res, status, page, title) => {
    return res.status(status).render("page", {
        title: title
    })
}