
const express = require("express");
const router = express.Router();

app.post('/initiate', async (req, res) => {
    try {
        console.log(req.body)
        const { title, id, price, customer_info, redirect_url } = req.body;
        var options = {
            'method': 'POST',
            'url': 'https://dev.khalti.com/api/v2/epayment/initiate/',
            'headers': {
                'Authorization': `key ${secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "return_url": redirect_url,
                "website_url": redirect_url,
                "amount": price * 100,
                "purchase_order_id": id,
                "purchase_order_name": title,
                "customer_info": customer_info
            })

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            res.json({ status: true, message: response.body });
        });


    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.response?.data?.detail || 'Payment initiation failed' });
    }
});

app.post('/verify', async (req, res) => {
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

module.exports = router;