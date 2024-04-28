$(document).ready(function () {
    $("#search-button").click(async () => {
        const fromLocation = $("#from-location").val().replaceAll(" ", "-");
        const toLocation = $("#to-location").val().replaceAll(" ", "-");
        const date = $("#travel-date").val();


        window.location.href = `/search?from=${fromLocation}&to=${toLocation}&date=${date}`;
    });
});