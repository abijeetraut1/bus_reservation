let seatsArr = [];


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
    btn.onclick = function () {
        // minimum transaction amount must be 10, i.e 1000 in paisa.
        checkout.show({
            amount: (baseTicketPrice * seatsArr.length) * 100
        });
    }
});


async function book_seats(bus_slug, from, to, date, bus_fare) {
    console.log(bus_slug, from, to, date)
    const seats = seatsArr;
    const year = date.split("-")[0];
    const month = date.split("-")[1];
    const day = date.split("-")[2]

    const book_seat_request = await axios({
        method: "POST",
        url: `/api/v1/bus/${bus_slug}/reserve-seat`,
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

    if(book_seat_request.data.status === "Success"){
        window.location.reload();
    }else{
        alert("Please Reload The Page");
    }

};