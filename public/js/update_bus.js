const name = $("#bus-name");
const number = $("#bus-number");
const price = $("#ticket-price");
const startLoc = $("#startLocation");
const endLoc = $("#endLocation");
const seatsCount = $("#total-seats");
const time = $("#journey-start-time");

async function check(busId) {
    sessionStorage.setItem("busId", busId);
    const busData = await axios.get(`/api/v1/bus/get-one-bus/${busId}`);

    if (busData.data.status === "Success") {
        const {
            busName,
            busNumber,
            endLocation,
            journeyStartTime,
            startLocation,
            ticketPrice,
            totalSeats,
            days,
            facilities
        } = busData.data.message;

        const daysArr = JSON.parse(days);
        const facilitiesArr = JSON.parse(facilities);

        const facilityNode = $(".facility");
        const daysNode = $(".days");
        daysArr.forEach((el, i) => {
            el.value === "true" ? daysNode[i].checked = true : daysNode[i].checked = false;
        });

        facilitiesArr.forEach((el, i) => {
            // Check if facilityNode[i] is defined before setting 'checked' property
            el.value === "true" ? facilityNode[i].checked = true : facilityNode[i].checked = false;
        });

        name.val(busName);
        number.val(busNumber);
        price.val(ticketPrice);
        startLoc.val(startLocation);
        endLoc.val(endLocation);
        seatsCount.val(totalSeats);
        time.val(journeyStartTime);
    }
}