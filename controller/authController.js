const database = require("../model/index");
const users = database.users;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    statusFunc
} = require("./../utils/statusFunc");
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
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
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

    if(login === null){
        return statusFunc(res, 400, "Cannot Find User");
    }

    if (await bcrypt.compare(password, login.password)) {
        return statusFunc(res, 400, "wrong email and password");
    }

    createRefreshToken(res, login);
}

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        const id = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
        const findUser = await users.findOne({
            where: {
                id: id.id
            },
            attributes: {
                excludes: ["createdAt", "updatedAt"]
            }
        })

        res.locals.user = findUser;
    }
    next();
}

exports.updateShowableData = async (req, res) => {
    const userData = res.locals.user;
    const {
        oldPassword,
        newPassword
    } = req.body;

    console.log(userData.password, oldPassword)

    if (!(await bcrypt.compare(oldPassword, userData.password))) {
        return statusFunc(res, 400, "Password didn't match");
    }

    const changePasswordUser = await users.findOne({
        where:{
            id: userData.id
        }
    })
    changePasswordUser.password = await bcrypt.hash(newPassword, 12);
    changePasswordUser.save();

    statusFunc(res, 200, "password changed sucessfully");
}