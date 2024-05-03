$(document).ready(function () {
    let seatsArr = [];

    let count = 0;
    const baseTicketPrice = parseInt($("#base-price")[0].innerText);
    console.log(baseTicketPrice)
    
    $(".avl-seat").each(function (index, element) {
        element.addEventListener("click", (ele) => {

            // return if the ticket is already booked
            if(element.classList.contains("bookedTicket")) return;

            // record the ticket
            if (element.classList.contains("active")) {
                count--;
                element.classList.remove("active");

                if(seatsArr.length === 1) seatsArr = [];
                seatsArr.filter(el => seatsArr.includes(el) ? seatsArr.splice(seatsArr.indexOf(el) - 1, seatsArr.indexOf(el)) : "" )
                
                $("#ticket-quantity").text(seatsArr.length) 
                $("#ticket-quantity").text(seatsArr.length) 
                
            } else {
                if (count === 3) return alert("cannot reserve more then 3 seat a time");                
                element.classList.add("active");
                console.log(element)

                seatsArr.push($(element).attr("value"));
                count++;
                
                $("#ticket-quantity").text(seatsArr.length)   
            }

            console.log(baseTicketPrice * seatsArr.length)
            $("#ticket-price").text(baseTicketPrice * seatsArr.length)
            $("#net-price").text(baseTicketPrice * seatsArr.length);


            $("#seats").html( seatsArr.map(el => `<span> ${el} </span>`) )
            console.log(seatsArr)
        });

    })
});