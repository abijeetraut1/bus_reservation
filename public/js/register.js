$(document).ready(async function () {

    $("#register-button").click(async (el) => {
        el.preventDefault();

        const username = $("#username").val();
        const phone = $("#contact-number").val();
        const password = $("#password").val();
        const passwordConfirm = $("#password-confirm").val();

        if(!(password === passwordConfirm)) return alert("wrong psw");

        const loginData = await axios({
            method: "POST",
            url: "/api/v1/user/signup?role=user",
            data: {
                phone: phone,
                name: username,
                password: password
            }
        })

        if (loginData.data.status === "Success") {
            alert("register")

            window.location.href = "/";
        }else{
            alert("WRONG CREDIENTIELS")
        }
    })
});