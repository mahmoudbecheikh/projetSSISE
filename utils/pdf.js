let pdf = require("html-pdf");
let path = require("path");
let ejs = require("ejs");

const createPDF =   async(data_order,data_details,name) => {


    await ejs.renderFile(path.join(__dirname, '../views/', "admin/facture.ejs"), {order : data_order , details : data_details}, async(err, data) => {
        if (err) {
            console.log(err)
        } else {
            let options = {
                "height": "11.25in",
                "width": "8.5in",
                "header": {
                    "height": "20mm"
                },
                "footer": {
                    "height": "20mm",
                },
            };
             await pdf.create(data, options).toFile(name+".pdf", async (err, data) => {
                if (err) {
                    console.log(err)
                    return false ; 
                } else {
                    console.log("File created successfully");

                }
            });
        }
    });


};

module.exports = createPDF;