$(document).ready(function () {
    $("#register-bus").click(async () => {
        const busName = $("#bus-name").val();
        const busNumber = $("#bus-number").val();
        const ticketPrice = $("#ticket-price").val();
        const startLocation = $("#startLocation").val();
        const endLocation = $("#endLocation").val();
        const totalSeats = $("#total-seats").val();
        const journeyStartTime = $("#journey-start-time").val();
        const sunday = $("#sunday").prop("checked");
        const monday = $("#monday").prop("checked");
        const tuesday = $("#tuesday").prop("checked");
        const wednesday = $("#wednesday").prop("checked");
        const thursday = $("#thursday").prop("checked");
        const friday = $("#friday").prop("checked");
        const saturday = $("#saturday").prop("checked");
        const acValue = $("#ac").prop("checked");
        const blanketValue = $("#blanket").prop("checked");
        const busTrackingValue = $("#bus_tracking").prop("checked");
        const cctvValue = $("#cctv").prop("checked");
        const chargingPointValue = $("#charging_point").prop("checked");
        const movieValue = $("#movie").prop("checked");
        const noSmokingValue = $("#no-smoking").prop("checked");
        const sosValue = $("#sos").prop("checked");
        const washroomValue = $("#washroom").prop("checked");
        const waterBottleValue = $("#water_bottle").prop("checked");
        const wifiValue = $("#wifi").prop("checked");

        const formData = new FormData();

        formData.append('busName', busName);
        formData.append('busNumber', busNumber);
        formData.append('ticketPrice', ticketPrice);
        formData.append('startLocation', startLocation);
        formData.append('endLocation', endLocation);
        formData.append('journeyStartTime', journeyStartTime);
        formData.append('totalSeats', totalSeats);
        formData.append('sunday', sunday);
        formData.append('monday', monday);
        formData.append('tuesday', tuesday);
        formData.append('wednesday', wednesday);
        formData.append('thursday', thursday);
        formData.append('friday', friday);
        formData.append('saturday', saturday);
        formData.append('ac', acValue);
        formData.append('blanket', blanketValue);
        formData.append('busTracking', busTrackingValue);
        formData.append('cctv', cctvValue);
        formData.append('chargingPoint', chargingPointValue);
        formData.append('movie', movieValue);
        formData.append('noSmoking', noSmokingValue);
        formData.append('sos', sosValue);
        formData.append('washroom', washroomValue);
        formData.append('waterBottle', waterBottleValue);
        formData.append('wifi', wifiValue);

        const imagesInput = document.getElementById('bus-images');
        for (let i = 0; i < imagesInput.files.length; i++) {
            formData.append('busImage', imagesInput.files[i]);
        }

        const uploadBusAzios = await axios({
            method: "POST",
            url: "/api/v1/bus/register-bus",
            data: formData
        })

        console.log(uploadBusAzios);
    })

})