const database = require("../model/index");
const users = database.users;

const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const {
    statusFunc
} = require("./../utils/statusFunc");
require('dotenv').config();

const createRefreshToken = (res, userData) => {
    const id = userData.id;
    const token = jwtToken(id);

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
        phoneno,
        email,
        firstName,
        lastName,
        password
    } = req.body;

    if(!phoneno || !email || !firstName || !lastName || !password){
        return statusFunc(res, 400, "you forget to insert the field");
    }

    const checkUser = await users.findOne({
        where: {
            phoneNo: phoneno,
        }
    })

    if (checkUser) {
        statusFunc(res, 400, "user already exist");
    }

    const code = Math.floor(Math.random() * (process.env.MAX_GENERATION - process.env.MIN_GENERATION + 1) + process.env.MIN_GENERATION);

    const signup = await users.create({
        phoneNo: phoneno,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
        password: await bcrypt.hash(password, 12),
        isVerified: false,
        verificationCode: code,
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

    if (login === null) {
        return statusFunc(res, 400, "Cannot Find User");
    }

    if (!(await bcrypt.compare(password, login.password))) {
        return statusFunc(res, 400, "wrong email and password");
    }

    createRefreshToken(res, login);
}

// login checker
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

// chanage password 
exports.updatePassword = async (req, res) => {
    const userData = res.locals.user;
    const {
        oldPassword,
        newPassword
    } = req.body;


    if (!(await bcrypt.compare(oldPassword, userData.password))) {
        return statusFunc(res, 400, "Password didn't match");
    }

    const changePasswordUser = await users.findOne({
        where: {
            id: userData.id
        }
    })
    changePasswordUser.password = await bcrypt.hash(newPassword, 12);
    changePasswordUser.save();

    statusFunc(res, 200, "password changed sucessfully");
}

// check verification
exports.numberVerification = async (req, res) => {
    const user = res.locals.user;
    if (req.body.verificationCode) {
        const verifyUser = await users.findOne({
            where: {
                id: user.id
            }
        })

        if (verifyUser.verificationCode === req.body.verificationCode) {
            verifyUser.isVerified = 1 || true;
            verifyUser.save();
            statusFunc(res, 202, "verified");
        } else {
            statusFunc(res, 400, "wrong verification code");
        }
    }
}


// upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    const user = res.locals.user;

    const userProfile = await users.findOne({
        where: {
            id: user.id
        }
    })

    userProfile.profile = req.file.filename;
    userProfile.save();
    statusFunc(res, 201, userProfile)
}


// change number
exports.changeNumber = async (req, res) => {
    const user = res.locals.user;

    // send verification code to new number to verify that number belongs to the same user

    if (!(await bcrypt.compare(req.body.password, user.password))) {
        statusFunc(res, 400, "wrong password");
    } else {
        const numberUpdate = await users.findOne({
            where: {
                id: user.id
            }
        })
        numberUpdate.phoneNo = req.body.phone;
        numberUpdate.save();
        statusFunc(res, 200, "Number updated sucessfully to : " + req.body.phone);
    }
}

// forget password
exports.generate_password_forget_code = async (req, res, next) => {
    if (req.body.phoneno) {
        const passwordForgetUser = await users.findOne({
            where: {
                phoneNo: req.body.phoneno
            }
        });

        if (!passwordForgetUser) {
            return statusFunc(res, 400, "cannot find user with that number");
        } else {
            const code = Math.floor(Math.random() * (process.env.MAX_GENERATION - process.env.MIN_GENERATION + 1) + process.env.MIN_GENERATION);
            passwordForgetUser.verificationCode = code;
            passwordForgetUser.save();      
        }
        statusFunc(res, 200, "verification code send to :" + req.body.phoneno);
    }else{
        statusFunc(res, 400, "please enter account number");
    }
}