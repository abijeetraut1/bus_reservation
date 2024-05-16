async function register() {
    const username = $("#username").val();
    const phone = $("#contact-number").val();
    const password = $("#password").val();
    const passwordConfirm = $("#password-confirm").val();

    if (parseInt(phone) < 9700000000 || parseInt(phone) > 9899999999) {
        return $(".number-limit-hide").addClass("number-limit-show").removeClass("number-limit-hide")
    }

    if (!(password === passwordConfirm)) {
        return $(".wrong-password-hide").addClass("wrong-password-show").removeClass("wrong-password-hide")
    }

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
        window.location.href = "/";
    } else {
        $(".already-used-number-hide").addClass("already-used-number-show").removeClass("already-used-number-hide")
    }
}

async function register_company() {
    const username = $("#username").val();
    const phone = $("#contact-number").val();
    const password = $("#password").val();
    const passwordConfirm = $("#password-confirm").val();

    if (parseInt(phone) < 9700000000 || parseInt(phone) > 9899999999) {
        return $(".number-limit-hide").addClass("number-limit-show").removeClass("number-limit-hide")
    }

    if (!(password === passwordConfirm)) {
        return $(".wrong-password-hide").addClass("wrong-password-show").removeClass("wrong-password-hide")
    }

    const loginData = await axios({
        method: "POST",
        url: "/api/v1/user/signup?role=owner",
        data: {
            phone: phone,
            name: username,
            password: password
        }
    })


    if (loginData.data.status === "Success") {  
        window.location.href = "/";
    } else {
        $(".already-used-number-hide").addClass("already-used-number-show").removeClass("already-used-number-hide")
    }
}