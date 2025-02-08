const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); // Consider using for password hashing
const jwt = require('jsonwebtoken'); // Consider using for authentication

const SECRET_KEY = process.env.LOGINKEY; // Use an environment variable in production

const sendResetEmail = (recipientEmail) => {
    const token = jwt.sign({ email: recipientEmail }, SECRET_KEY, { expiresIn: "1h" }); // Token expires in 1 hour
    const resetLink = `https://rfp-plus.vercel.app/reset-password?token=${token}`;

    // Create reusable transporter object using Gmail SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'bcaboy27@gmail.com', // your Gmail address
            pass: 'hpol wqan pzua ypbj'   // your Gmail password or app password
        }
    });

    // Email content
    const mailOptions = {
        from: 'bcaboy27@gmail.com',
        to: recipientEmail,
        subject: 'Password Reset Request',
        html: `
            <p>Hello,</p>
            <p>We received a request to reset your password.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = sendResetEmail;
