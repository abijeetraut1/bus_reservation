const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path")
var cors = require('cors')
const request = require('request');

const database = require("./model/index");

const {
    QueryTypes,
    Sequelize
} = require('sequelize');

// setting up the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// ROUTER
const userRouter = require("./route/userRoute");
const busRouter = require("./route/busRouter");
const driverRouter = require("./route/driverRouter");
const viewRouter = require("./route/viewRouter");
const { sequelize } = require("./model");
// const khaltiRouter = require("./route/khalti");

// JSON DATA CARRIER
app.use(express.json({
    extends: true
}));

app.use(cors())
app.use(cookieParser());


app.post('/api/khalti/initiate', async (req, res) => {
    try {
        console.log(req.body)
        const {
            purchase_order_name,
            purchase_order_id,
            amount,
            customer_info,
            return_url,
            website_url,
            metadata
        } = req.body;

        var options = {
            'method': 'POST',
            'url': 'https://dev.khalti.com/api/v2/epayment/initiate/',
            'headers': {
                'Authorization': `key ${process.env.KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "return_url": return_url,
                "website_url": website_url,
                "amount": amount,
                "purchase_order_id": purchase_order_id,
                "purchase_order_name": purchase_order_name,
                "customer_info": customer_info
            })

        };

        request(options, async function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);

            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(today.getDate()).padStart(2, '0');

            console.log(metadata)
            // await database.sequelize.query(`CREATE TABLE IF NOT EXISTS payment-${metadata.busName} where (id INT primary key, )`)

            res.json({ status: true, message: JSON.parse(response.body) });
        });

        // console.log(response)

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.response?.data?.detail || 'Payment initiation failed' });
    }
});

app.post('/api/khalti/verify', async (req, res) => {
    const { pidx } = req.body;

    if (!pidx) {
        return res.status(400).json({ status: false, message: 'Missing pidx' });
    }

    try {
        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            {
                headers: {
                    Authorization: `Key ${KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = response.data;

        if (data.status === 'Completed') {

            console.log("payment complete", data)
            // ✅ Payment is successful. Do your DB updates here.
            // E.g., mark user/tournament as paid

            return res.json({ status: true, data });
        } else {
            return res.json({ status: false, message: 'Payment not completed', data });
        }

    } catch (err) {
        console.error('Verification Error:', err?.response?.data || err.message);
        return res.status(500).json({
            status: false,
            message: 'Failed to verify payment'
        });
    }
});



// router setup
app.use("/", viewRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/bus", busRouter)
app.use("/api/v1/driverProspective", driverRouter);

app.use("*", (req, res) => {
    res.render("not_found.pug", {
        title: "Not Found"
    });
})



module.exports = app;