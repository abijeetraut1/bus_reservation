

async function register() {
    const username = $("#username").val();
    const phone = $("#contact-number").val();
    const password = $("#password").val();
    const passwordConfirm = $("#password-confirm").val();

    if (!(password === passwordConfirm)) return alert("wrong psw");

    const loginData = await axios({
        method: "POST",
        url: "/api/v1/user/signup",
        data: {
            phone: phone,
            name: username,
            password: password
        }
    })


    if (loginData.data.status === "Success") {
        alert("register")
        
    } else {
        console.log(loginData)
    }
}