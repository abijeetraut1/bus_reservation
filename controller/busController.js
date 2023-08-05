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
    try {
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
    } catch (err) {
        throw err;
    }
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


exports.reserveSeat = async (req, res) => {
    try {
        const user = res.locals.user;
        const {
            slug,
            seatno,
            year,
            month,
            day
        } = req.params;

        const bus = await busModel.findOne({
            where: {
                slug
            }
        });

        const nowDate = new Date();
        const schemaName = `${year}-${month}-${day}-${bus.slug}`;

        const createTable = `CREATE TABLE IF NOT EXISTS \`${schemaName}\` (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, seatno INT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

        await database.sequelize.query(createTable, {
            type: QueryTypes.RAW
        });

        // check if the seat is already booked or not
        const checkReservedSeat = await database.sequelize.query(`SELECT * FROM \`${schemaName}\` WHERE seatno = ?`, {
            type: QueryTypes.SELECT,
            replacements: [seatno * 1],
        })
        
        // blocks the reservation if there's is already another one
        if(checkReservedSeat.length != 0){
            return statusFunc(res, 400, "seat is already reserved please check another one");
        }

        const reserveSeat = await database.sequelize.query(
            `INSERT INTO \`${schemaName}\` (userId, seatno, createdAt) VALUES (?, ?, NOW())`, // Use backticks to escape table name
            {
                type: QueryTypes.INSERT,
                replacements: [user.id, seatno]
            }
        );

        const userTravelSchema = user.id + "-" + user.firstName + "-" + user.lastName + "-travel-record";

        const createUserTravelRecord = `CREATE TABLE IF NOT EXISTS \`${userTravelSchema}\` (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, seatno INT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        await database.sequelize.query(createUserTravelRecord, {
            type: QueryTypes.RAW
        });

        // saves the user travel record
        const reservedDate = `${nowDate.getFullYear()}-${(nowDate.getMonth() + 1).toString().padStart(2, '0')}-${nowDate.getDate().toString().padStart(2, '0')}`;

        const resrveSeatRecord = await database.sequelize.query(
            `INSERT INTO \`${userTravelSchema}\` (userId, seatno, createdAt) VALUES (?, ?, NOW())`, {
                type: QueryTypes.INSERT,
                replacements: [user.id, seatno * 1]
            }
        );

        statusFunc(res, 200, {
            seat: reserveSeat,
            record: resrveSeatRecord
        });
    } catch (err) {
        return console.error(err);
    }

}

// 23-07-14-kankai-1234