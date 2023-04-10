import nodemailer from "nodemailer";

const sendEmail = async (option) => {
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "61588cd360c9a0",
            pass: "59f98d2c2d458b"
        }
    });

    const mailOptions = {
        from: "",
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transport.sendMail(mailOptions);
}

export default sendEmail;