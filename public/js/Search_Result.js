let seatsArr = [];

async function initiatePayment(el, user, bus) {

    const userData = JSON.parse(user);
    const busData = JSON.parse(bus);

    const urlParams = new URLSearchParams(window.location.search);

    const from = urlParams.get('from');
    const to = urlParams.get('to');

    console.log(busData);

    console.log(userData, busData)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');

    const book_seat_request = await axios({
        method: "POST",
        url: 'api/khalti/initiate',
        data: {
            return_url: "http://localhost:8000/payment/success",
            website_url: "http://localhost:8000",
            amount: (seatsArr.length * busData.bus_fare) * 100,
            purchase_order_id: `${busData.id}-${year}${month}${day}-${seatsArr.join("-")}`,
            purchase_order_name: `${busData.id}--${userData.id}--${from}--${to}--${seatsArr.join(",")}`,
            customer_info: {
                name: user.name || "user",
                email: user.email || "user@example.com",
                phone: user.phoneNo || "9800000000"
            },
            metadata: {
                bus_id: busData.id,
                busName: busData.busName,
                bus_number: busData.busNumber,
                bus_fare: busData.bus_fare,
                seats: seatsArr,
                from: from,
                to: to
            }
        },
    })

    if (book_seat_request.data.status === true) {
        console.log("assigned", book_seat_request.data.message.payment_url)
        window.location.assign(book_seat_request.data.message.payment_url);
    }
    console.log(book_seat_request);
}

$(document).ready(function () {



    let count = 0;
    const baseTicketPrice = parseInt($("#base-price")[0].innerText);
    console.log(baseTicketPrice)

    $(".avl-seat").each(function (index, element) {
        element.addEventListener("click", (ele) => {

            // return if the ticket is already booked
            if (element.classList.contains("bookedTicket")) return;

            // record the ticket
            if (element.classList.contains("active")) {
                count--;
                element.classList.remove("active");

                if (seatsArr.length === 1) seatsArr = [];
                seatsArr.filter(el => seatsArr.includes(el) ? seatsArr.splice(seatsArr.indexOf(el) - 1, seatsArr.indexOf(el)) : "")

                $("#ticket-quantity").text(seatsArr.length)
                $("#ticket-quantity").text(seatsArr.length)

            } else {
                if (count === 3) return alert("cannot reserve more then 3 seat a time");
                element.classList.add("active");

                seatsArr.push($(element).attr("value"));
                count++;

                $("#ticket-quantity").text(seatsArr.length)
            }

            $("#ticket-price").text(baseTicketPrice * seatsArr.length)
            $("#net-price").text(baseTicketPrice * seatsArr.length);


            $("#seats").html(seatsArr.map(el => `<span> ${el} </span>`))
        });

    })


    var config = {
        // replace the publicKey with yours
        "publicKey": "test_public_key_dc74e0fd57cb46cd93832aee0a390234",
        "productIdentity": "1234567890",
        "productName": "Dragon",
        "productUrl": "http://gameofthrones.wikia.com/wiki/Dragons",
        "paymentPreference": [
            "KHALTI",
        ],
        "eventHandler": {
            onSuccess(payload) {
                // hit merchant api for initiating verfication
                console.log(payload);
                book_seats_khalti(payload);
            },
            onError(error) {
                console.log(error);
            },
            onClose() {
                console.log('widget is closing');
            }
        }
    };

    var checkout = new KhaltiCheckout(config);
    var btn = document.getElementById("payment-button");
});


async function book_seats(bus_slug, from, to, date, bus_fare) {
    console.log(bus_slug, from, to, date)
    const seats = seatsArr;
    const year = date.split("-")[0];
    const month = date.split("-")[1];
    const day = date.split("-")[2]



    const book_seat_request = await axios({
        method: "POST",
        url: '/api/khalti/initiate',
        // url: `/api/v1/bus/${bus_slug}/reserve-seat`,
        data: {
            seatno: seats,
            passengerCurrentLocation: from,
            passengerDestination: to,
            year: year,
            month: month,
            day: day,
            price: bus_fare
        }
    })

    if (book_seat_request.data.status === "Success") {
        window.location.assign = "/tickets";
    } else {
        alert("Please Reload The Page");
    }

};

async function book_seats_khalti(payload) {
    const bus_slug = window.location.pathname.split("/")[2];
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    const baseTicketPrice = parseInt($("#base-price")[0].innerText);

    const book_seat_request = await axios({
        method: "POST",
        url: `/api/v1/bus/khalti-payment-verification`,
        data: {
            ...payload,
            seatno: seatsArr,
            passengerCurrentLocation: from,
            passengerDestination: to,
            date: date,
            price: baseTicketPrice * seatsArr.length
        }
    })

    if (book_seat_request.data.status === "Success") {
        window.location.assign = "/tickets";
    } else {
        alert("Please Reload The Page");
    }
}