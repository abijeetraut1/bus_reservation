const express = require("express");
const router = express.Router();

const viewController = require("./../controller/viewController")
const adminPanel = require("./../controller/admin_panel/admin_panel")
const authController = require("./../controller/authController")

router.use(authController.isLoggedIn);

router.get("/", viewController.home);
router.get("/search", viewController.search);
router.get("/login", viewController.login);
router.get("/register", viewController.register);
router.get("/logout", viewController.logout);

// router.get('/initiate-payment', adminPanel.payment_request);
const stripe = require('stripe')('sk_test_51PCFKESCr9yQB7OIgWwuHwRQyvpBv5NDU0D6QrQtDvtoD99P3jHoo3bShnAjMiSjxPdwTzDKLTaEpVZaOVifJec000loBuXI73');

router.post('/charge', async (req, res) => {
    // const { amount, currency, description, source } = req.body;
    const amount = "1200";
    const currency = "inr";
    const description = "yo mf";
    const source = "card";

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            description,
            payment_method_types: ['card'],
            payment_method: 1, 
            confirm: true,
        });

        // Payment succeeded
        res.json({
            success: true,
            paymentIntent
        });
    } catch (error) {
        // Payment failed
        console.error('Error processing payment:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});



router.post('/create-checkout-session/:slug', viewController.checkout_session);

// admin panel 
router.use(authController.isOwnerLoggedIn);

router.get("/admin/dashboard", adminPanel.addBus);
router.get("/admin/show-all-bus", adminPanel.show_all_bus);
router.get("/admin/add-bus", adminPanel.addBus);
router.get("/admin/bookedseat", adminPanel.bookedSeat);
router.get("/admin/income", adminPanel.income);
router.get("/admin/worker-account", adminPanel.createWorkersAccount);
router.get("/admin/assistants", adminPanel.assistants);

module.exports = router;