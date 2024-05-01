$(document).ready(function () {
    $("#create-worker-account").click(async (el) => {        
        el.preventDefault();
        const phone = $("#worker-number").val();
        const name = $("#worker-name").val();
        const password = $("#worker-password").val();
        const role = $("#worker-role").val();
    
        const createWorkerAccount = await axios({
            method: "POST",
            url: `/api/v1/user/signup?role=${role}`,
            data: {
                phone,
                name,
                password
            }
        })

        if(createWorkerAccount.data.status === "Success"){
            alert("user created");
        }
    })
});