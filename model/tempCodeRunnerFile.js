const fs = require("fs");

fs.readFileSync("./model/testData/tempData.json", "utf-8", (data) => {
    console.log(data)
})