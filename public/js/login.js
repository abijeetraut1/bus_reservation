$(document).ready(async function () {

    
    $("#login-button").click(async (el) => {
        el.preventDefault();

        const phone = $("#contact-number").val();
        const password = $("#password").val();

        const loginData = await axios({
            method: "POST",
            url: "/api/v1/user/login",
            data: {
                phone: phone,
                password: password
            }
        })

        console.log(loginData)
        if (loginData.data.status === "Success") {
            console.log("login")

            window.location.href = "/";
        }else{
            alert("WRONG CREDIENTIELS")
        }
    })
});