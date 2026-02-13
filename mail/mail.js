import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Ez a smtp.gmail.com közvetlen IPv4 címe
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "romandi.klinik@gmail.com",
    pass: "kmds bgef mhmb jalt",
  },
});

// Send an email using async/await
(async () => {
  const info = await transporter.sendMail({
    from: '"Romándi Vadászház Klinik Központi Értesítés <romandi.klinik@gmail.com>', // Sender address
    to: "soos.gabor@jedlik.eu",
    subject: "Klinik teszt email", // Subject line
    text: "Klinik", // Plain-text version of the message
    html: "<b>Klinik</b>", // HTML version of the message
  });

  console.log("Message sent:", info.messageId);
})();