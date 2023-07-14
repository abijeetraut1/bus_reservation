const database = require("../model/index");
const users = database.users;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { statusFunc } = require("./../utils/statusFunc");
require('dotenv').config();

const createRefreshToken = (res, userData) => {
    const id = userData.id;
    const token = jwtToken(id);
    
    console.log(token);

    res.cookie("jwt", token, {
        expires: new Date(
            Date.now() + process.env.BROWSER_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    })

    statusFunc(res, 201, token)
}

const jwtToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}


// signup
exports.signup = async (req, res) => {
    const {
        phone,
        email,
        firstName,
        lastName,
        password
    } = req.body;

    const checkUser = await users.findOne({
        where: {
            phoneNo: phone,
        }
    })

    if (checkUser) {
        statusFunc(res, 400, "user already exist")
    }

    const signup = await users.create({
        phoneNo: phone,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
        password: await bcrypt.hash(password, 12)
    })

    createRefreshToken(res, signup);
}

// login
exports.login = async (req, res) => {
    const {
        phone,
        password
    } = req.body;

    const login = await users.findOne({
        where: {
            phoneNo: phone,
        }
    })

    if (!(bcrypt.hash(login.password, password))) {
        return statusFunc(res, 400, "wrong email and password");
    }

    createRefreshToken(res, login);
}