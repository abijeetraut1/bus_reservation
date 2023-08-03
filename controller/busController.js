const {
    statusFunc
} = require("../utils/statusFunc");
const database = require("./../model/index");
const busModel = database.bus;

const {
    QueryTypes
} = require("sequelize");

exports.registerBus = async (req, res) => {
    const user = res.locals.user;
    let image = [];
    req.files.forEach(el => {
        image.push(el.filename);
    });

    const {
        busNumber,
        busName,
        isAcAvailable,
        isWaterProvidable,
        isBlankeProvidable,
        noOfStaff,
        isCharginPointAvailable,
        isCCTVavailable,
        acceptMobileTicket,
    } = req.body;



    const registerBus = await busModel.create({
        busNumber: busNumber,
        busName: busName,
        isAcAvailable: isAcAvailable,
        isWaterProvidable: isWaterProvidable,
        isBlankeProvidable: isBlankeProvidable,
        noOfStaff: noOfStaff,
        isCharginPointAvailable: isCharginPointAvailable,
        isCCTVavailable: isCCTVavailable,
        acceptMobileTicket: acceptMobileTicket,
        busImages: image,
        userId: user.id * 1
    });

    statusFunc(res, 200, registerBus);
}