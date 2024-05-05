async function deleteData(url) {

    const deleteRequest = await axios({
        method: "DELETE",
        url: `/api/v1/${url}`
    });

    if(deleteRequest.data.status === "Success"){
        window.location.reload();
    }else{
        alert("CANNOT DELETE USER");
    }
    console.log(deleteRequest);
}