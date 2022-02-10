const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text, file=null) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'becheikh.mahmoud.4@gmail.com',
                pass: 'becheikh0000'
            }
        });

        if (file==null){
        await transporter.sendMail({
                from: 'becheikh.mahmoud.4@gmail.com',
                to: email,
                subject: subject,
                text : text,
            });
        }
        else {
            await transporter.sendMail({
                from: 'becheikh.mahmoud.4@gmail.com',
                to: email,
                subject: subject,
                text : text,
                attachments: [
                    {
                        path:  file
                    }
                ]
            });
        }



        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;