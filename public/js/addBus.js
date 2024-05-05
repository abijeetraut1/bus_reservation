async function busOperation(url) {
    const busName = $("#bus-name").val();
    const busNumber = $("#bus-number").val();
    const ticketPrice = $("#ticket-price").val();
    const startLocation = $("#startLocation").val();
    const endLocation = $("#endLocation").val();
    const totalSeats = $("#total-seats").val();
    const stopcut = $("#stop-cut-price").val();
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
    const busTrackingValue = $("#busTracking").prop("checked");
    const cctvValue = $("#cctv").prop("checked");
    const chargingPointValue = $("#chargingPoint").prop("checked");
    const movieValue = $("#movie").prop("checked");
    const noSmokingValue = $("#noSmoking").prop("checked");
    const sosValue = $("#sos").prop("checked");
    const washroomValue = $("#washroom").prop("checked");
    const waterBottleValue = $("#waterBottle").prop("checked");
    const wifiValue = $("#wifi").prop("checked");
    

    // el.preventDefault();

    // console.log(url)

    if(url === "update-bus"){
        url = url + "/" + sessionStorage.getItem("busId");
    }

    console.log(url)


    const formData = new FormData();

    formData.append('busName', busName);
    formData.append('busNumber', busNumber);
    formData.append('ticketPrice', ticketPrice);
    formData.append('startLocation', startLocation);
    formData.append('endLocation', endLocation);
    formData.append('journeyStartTime', journeyStartTime);
    formData.append('totalSeats', totalSeats);
    formData.append('stopCut', stopcut);
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

    // const select = $("#select-bus").val();
    // console.log(select)

    // window.location.pathname === '/admin/update-bus' ? `/api/v1/bus/update-bus/${select}` :
    // `/api/v1/bus/register-bus`,
    const uploadBusAxios = await axios({
        method: "POST",
        url: `/api/v1/bus/${url}`,
        data: formData
    })

    if(uploadBusAxios.data.status === "Success"){
        window.location.reload();
    }else{
        alert("Failed to Upload data Please Reload! 🔮");
    }
}