const { statusFunc } = require("../utils/statusFunc");
const database = require("./../model/index");
const busModel = database.bus;

exports.registerBus = async (req, res) => {
    const {
        busNumber,
        busName,
        isAcAvailable,
        isWaterProvidable,
        isBlankeProvidable,
        noOfStaff,
        isCharginPointAvailable,
        isCCTVavailable
    } = req.body;

    const registerBus = await busModel.create({
        busNumber,
        busName,
        isAcAvailable,
        isWaterProvidable,
        isBlankeProvidable,
        noOfStaff,
        isCharginPointAvailable,
        isCCTVavailable,
        busImages: image 
    });

    statusFunc(res, 200, registerBus)
}