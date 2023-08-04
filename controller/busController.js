const {
    statusFunc
} = require("../utils/statusFunc");
const database = require("./../model/index");
const busModel = database.bus;


const {
    QueryTypes,
    Sequelize
} = require('sequelize');

exports.registerBus = async (req, res) => {
    const user = res.locals.user;

    // adding image name in array
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
        fromLocation,
        toLocation,
        noOfSheats,
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday
    } = req.body;

    const beforeUploadedData = await busModel.findAll({
        where: {
            busNumber: busNumber,
        }
    });

    if (beforeUploadedData.length != 0) {
        return statusFunc(res, 400, "you already uploaded this bus")
    }

    if (
        !busNumber ||
        !busName ||
        !isAcAvailable ||
        !isCharginPointAvailable ||
        !isBlankeProvidable ||
        !noOfStaff ||
        !isWaterProvidable ||
        !isCCTVavailable ||
        !acceptMobileTicket ||
        !fromLocation ||
        !toLocation || 
        !noOfSheats || 
        !sunday ||  
        !monday || 
        !tuesday || 
        !wednesday || 
        !thursday ||
        !friday ||
        !saturday
    ) {
        return statusFunc(res, 200, "you forget to insert some field");
    }


    // journey dates
    let joruneyDates = [];
    const day = [sunday, monday, tuesday, wednesday, thursday, friday, saturday]
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];


    // this stores all the day and dates into objects of array
    for (let i = 0; i < day.length; i++) {
        joruneyDates.push({
            day: dayNames[i],
            time: day[i]
        })
    }

    const registerBus = await busModel.create({
        busNumber: busNumber,
        busName: busName,
        isAcAvailable: isAcAvailable,
        isWaterProvidable: isWaterProvidable,
        isBlankeProvidable: isBlankeProvidable,
        noOfStaff: noOfStaff,
        noOfSheats: noOfSheats,
        isCharginPointAvailable: isCharginPointAvailable,
        isCCTVavailable: isCCTVavailable,
        acceptMobileTicket: acceptMobileTicket,
        busImages: image,
        fromLocation,
        toLocation,
        joruneyDates: joruneyDates,
        slug: busName.replaceAll(" ", "-") + "-" + busNumber,
        userId: user.id * 1
    });

    statusFunc(res, 200, registerBus);
}

exports.searchBus = async (req, res) => {
    const {
        fromLocation,
        toLocation
    } = req.body;

    if (!fromLocation || !toLocation) {
        return statusFunc(res, 200, "please enter appropriate location");
    }


    const searchResult = await database.sequelize.query(
        'SELECT * FROM buses WHERE fromLocation LIKE :fromLocation', {
            type: QueryTypes.SELECT,
            replacements: {
                fromLocation: `%${fromLocation}%`,
                toLocation: `%${toLocation}%`
            }
        }
    );

    statusFunc(res, 200, searchResult);
}


// bus take off 
exports.busJourneyStart = async (req, res) => {

}