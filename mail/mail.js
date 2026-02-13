import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Ez a smtp.gmail.com közvetlen IPv4 címe
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "oliverroncz@gmail.com",
    pass: "trdfzjzdsockfvqw",
  },
});

// Send an email using async/await
(async () => {
  const info = await transporter.sendMail({
    from: '"Szemethy" <oliverroncz@gmail.com>',
    to: "roncz.oliver@students.jedlik.eu",
    subject: "Hello ✔",
    text: "Hello world?", // Plain-text version of the message
    html: "<b>Hello world?</b>", // HTML version of the message
  });

  console.log("Message sent:", info.messageId);
})();