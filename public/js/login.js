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
        
        if (loginData.data.status === "Success") {
            console.log("login")

            window.location.href = "/";
        }else{
            console.log("hello")
            $(".invalid-notation-hide").addClass("invalid-notation-show").removeClass("invalid-notation-hide")
        }
    })
});