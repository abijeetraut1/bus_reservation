$(document).ready(async function () {


    $("#login-button").click(async (el) => {
        el.preventDefault();

        const phone = $("#contact-number").val();
        const password = $("#password").val();

        try {
            const loginData = await axios({
                method: "POST",
                url: "/api/v1/user/login",
                data: {
                    phone: phone,
                    password: password
                }
            });

            if (loginData.data.status === "Success") {
                window.location.assign('/');
            }
        } catch (error) {
            const errorMessage = error.response.data.message;
            if (errorMessage === "wrong email and password") {
                alert("Wrong password! Please try again.");
            } else if (errorMessage === "Cannot Find User") {
                alert("User not found. Please check your phone number.");
            } else {
                alert("An error occurred during login. Please try again.");
            }
        }
    })
});