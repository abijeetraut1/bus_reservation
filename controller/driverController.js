const database = require("../model/index");

const {Sequelize, QueryTypes} = require("sequelize");

exports.checkTicket = async(req, res) => {
    const {bus, seat} = req.params;

    const tableName = "2024-04-10".replaceAll("-", "_") + "_" + bus.toLowerCase().replaceAll("-", "_");
    const selectData = await database.sequelize.query(`UPDATE ${tableName} SET isTicketChecked = 1 WHERE seatNo = '${seat}' `,{
        type: QueryTypes.UPDATE
    })

    console.log(selectData)
    
}