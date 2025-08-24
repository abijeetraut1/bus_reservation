const {
    statusFunc
} = require("../utils/statusFunc");
const db = require("./../model/index");
const Bus = db.buses;
const Rating = db.ratings;
const User = db.users;

exports.rateBus = async (req, res) => {
    try {
        const slug = req.params.slug;
        const {
            rate,
            review
        } = req.body;
        const userId = res.locals.user.id;

        // Find the bus by slug
        const bus = await Bus.findOne({
            where: {
                slug: slug
            }
        });

        if (!bus) {
            return statusFunc(res, 404, "Bus not found");
        }

        // Check if the user has already reviewed this bus
        const existingRating = await Rating.findOne({
            where: {
                userId: userId,
                busId: bus.id
            }
        });

        if (existingRating) {
            return statusFunc(res, 400, "You have already reviewed this bus.");
        }

        // Create the new rating
        const newRating = await Rating.create({
            rate,
            review,
            userId: userId,
            busId: bus.id
        });

        statusFunc(res, 201, newRating);

    } catch (err) {
        console.error(err);
        return statusFunc(res, 500, "Internal server error");
    }
}