exports.addBus = (req, res) => {
    res.render("./admin_pannel/add_product.pug", {
        title: "Add Bus"
    })
}

exports.createWorkerAccount = (req, res) => {
    res.render("./admin_pannel/add_account.pug", {
        title: "Add Account"
    })
}