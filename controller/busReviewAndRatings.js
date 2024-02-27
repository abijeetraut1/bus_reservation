const {
    statusFunc
} = require("../utils/statusFunc");
const database = require("./../model/index");
const {
    QueryTypes
} = require("sequelize")

exports.rateBus = async (req, res) => {
    try {
        const slug = req.params.slug.replaceAll("-", "_");

        const user = 1;
        const {
            rate,
            review
        } = req.body;

        // create review and rating table
        await database.sequelize.query(`CREATE TABLE IF NOT EXISTS ${slug+"_ratings"} (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, busId INT, rate INT, review TEXT, aggree INT, disaggree INT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        const checkAlreadyReviewed =  await database.sequelize.query(`SELECT ${slug+"_ratings"}.userId FROM ${slug+"_ratings"}`, {
            type: QueryTypes.SELECT,
        });

        // prevent user reviewing more then one time
        if(checkAlreadyReviewed[0].userId === user){
            return statusFunc(res, 200, "cannot review on single bus more then one");
        }

        // find the bus
        const bus = await database.sequelize.query(`SELECT buses.id FROM buses WHERE slug = ?`, {
            type: QueryTypes.SELECT,
            replacements: [slug.replaceAll("_", "-")]
        })

        const uploadBusRating = await database.sequelize.query(`INSERT INTO ${slug+"_ratings"} (userid , busId, rate, review, aggree, disaggree) VALUES (?, ?, ?, ?, ?, ?)`, {
            type: QueryTypes.INSERT,
            replacements: [user, bus[0].id, rate, review, 0, 0]
        })

        statusFunc(res, 201, uploadBusRating);

    } catch (err) {
        console.log(err)
        return statusFunc(res, 400, err)
    }
}
