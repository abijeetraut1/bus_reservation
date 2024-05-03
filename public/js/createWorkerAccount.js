$(document).ready(function () {
    $("#create-worker-account").click(async (el) => {
        el.preventDefault();
        const phone = $("#worker-number").val();
        const name = $("#worker-name").val();
        const password = $("#worker-password").val();
        const bus = $("#select-bus").val();

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
        }
    })
});