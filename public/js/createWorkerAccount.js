$(document).ready(function () {
    $("#create-worker-account").click(async (el) => {
        el.preventDefault();
        const phone = $("#worker-number").val();
        const name = $("#worker-name").val();
        const password = $("#worker-password").val();
        const passwordConfirm = $("#worker-password-confirm").val();
        
        const bus = $("#select-bus").val();

        if (parseInt(phone) < 9700000000 || parseInt(phone) > 9899999999) {
            return $(".number-limit-hide").addClass("number-limit-show").removeClass("number-limit-hide")
        }
    
        if (!(password === passwordConfirm)) {
            return $(".wrong-password-hide").addClass("wrong-password-show").removeClass("wrong-password-hide")
        }

        const createWorkerAccount = await axios({
            method: "POST",
            url: `/api/v1/user/signup?role=conductor`,
            data: {
                phone,
                name,
                password,
                bus
            }
        })

        if (createWorkerAccount.data.status === "Success") {
            alert("user created");
            $("#worker-number").val("")
            $("#worker-name").val("")
            $("#worker-password").val("");
            $("#worker-password-confirm").val("");
        }else{
            $(".already-used-number-hide").addClass("already-used-number-show").removeClass("already-used-number-hide")
        }
    })
});