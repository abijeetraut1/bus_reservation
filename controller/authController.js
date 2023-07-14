const database = require("../model/index");
const users = database.users;
const {
    statusFunc
} = require("./../utils/statusFunc");
const bcrypt = require("bcrypt");

// signup
exports.signup = async (req, res) => {
    const {
        phone,
        email,
        firstName,
        lastName,
        password
    } = req.body;

    const signup = await users.create({
        phoneNo: phone,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
        password: password
    })

    statusFunc(res, 201, signup);
}

