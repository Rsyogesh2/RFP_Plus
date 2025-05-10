const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const sgMail = require('@sendgrid/mail')
require('dotenv').config();  // Load environment variables

const LOGINKEY = process.env.LOGINKEY; // Ensure this is defined
const API_URL = process.env.API_URL || 'http://localhost:3000';


const sendResetEmail = (recipientEmail,userName) => {
    const token = jwt.sign({ email: recipientEmail }, LOGINKEY, { expiresIn: "1h" });
    const resetLink = `${API_URL}/reset-password?email=${recipientEmail}&token=${token}`;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: recipientEmail, // Change to your recipient
    //   from: `"RFP Manage"<RFPManage@${process.env.Domain_Name}>`, // Change to your verified sender
      from: `RFPManage@${process.env.Domain_Name}`, // Change to your verified sender
        subject: 'Reset Your RFPmanage Password',
        html: `
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password for your RFPmanage account. No worries—we’re here to help!</p>
            <p>Click the button below to set a new password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>If you didn’t request this, you can ignore this email. Your account remains secure.</p>
            <p>For any assistance, feel free to contact our support team.</p>
            <p><strong>RFPmanage Team</strong></p>
        `  
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
};

 const sendActivationEmail = (recipientEmail, userName) => {
    if (!LOGINKEY) {
        console.error("Error: LOGINKEY is missing in environment variables!");
        return;
    }

    // Generate activation token (valid for 24 hours)
    const token = jwt.sign({ email: recipientEmail }, LOGINKEY, { expiresIn: "24h" });
    const activationLink = `${API_URL}/activate-account?email=${recipientEmail}&token=${token}`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: recipientEmail, // Change to your recipient
      from: `RFPManage@${process.env.Domain_Name}`, // Change to your verified sender
        subject: 'Welcome to RFPmanage! Activate your account now.',
        html: `
            <p>Hi ${userName},</p>
            <p>Greetings from RFPmanage. You're almost ready to explore all the features of rfpmanage.com.</p>
            <p>Your email id will be your user id. Click here to activate your account and unlock access to your user id</p>
            <p>Activate Now:</p>
            <p><a href="${activationLink}" style="display:inline-block;padding:10px 20px;font-size:16px;color:#fff;background:#28a745;text-decoration:none;border-radius:5px;">Activate Account</a></p>
            <p><strong>RFPmanage Team</strong></p>
        `  
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
};
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

async function saveOtpToDB(email, otp) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const query = `
    INSERT INTO otp_requests (email, otp, expires_at)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      otp = VALUES(otp),
      expires_at = VALUES(expires_at),
      created_at = NOW()
  `;  
    await db.query(query, [email, otp, expiresAt]);
  }
  
const sendOtpEmail = (recipientEmail, userName) => {
    const otp = generateOTP();
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: recipientEmail,
      from: `RFPManage@${process.env.Domain_Name}`,
      subject: 'Your RFPmanage OTP Code',
      html: `
        <p>Hi ${userName},</p>
        <p>Your OTP for RFPmanage is:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 5 minutes. Do not share it with anyone.</p>
        <p>If you didn’t request this, please ignore the email.</p>
        <p><strong>RFPmanage Team</strong></p>
      `
    };
  
    sgMail
      .send(msg)
      .then(() => {
        saveOtpToDB(recipientEmail, otp);
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
};

async function verifyOtp(recipientEmail, inputOtp) {
    const query = `
      SELECT * FROM otp_requests
    WHERE email = ? AND otp = ? AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
    `;
    const [rows] = await db.query(query, [recipientEmail, inputOtp]);
    return rows.length > 0;
  }
  
  
// ✅ Export both functions
module.exports = { sendActivationEmail, sendResetEmail, sendOtpEmail, verifyOtp };