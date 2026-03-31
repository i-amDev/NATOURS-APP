const nodemailer = require("nodemailer");

const sendEmail = async options => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 25,
        auth: {
            user: "bbeb3a9c825cf6",
            pass: "b26058a8ac6e64"
        }
    });
    // Define the email options
    const mailOptions = {
        from: "Tony <tony@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // Actually send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;