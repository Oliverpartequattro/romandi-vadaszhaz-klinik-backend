import nodemailer from "nodemailer";

/**
 * Üdvözlő email küldése regisztrációkor
 */
export const sendWelcomeEmail = async (to, userName) => {
    // HIBAKERESÉS: Ha ez üres a konzolban, a .env betöltése a server.js-ben hibás!
    if (!process.env.EMAIL_PASS) {
        console.error("❌ KRITIKUS HIBA: Az EMAIL_PASS környezeti változó nem található!");
        return false;
    }

    // A transportert a függvényen BELÜL hozzuk létre
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "romandi.klinik@gmail.com",
            pass: process.env.EMAIL_PASS, // 16 karakteres Google alkalmazásjelszó
        },
    });

    const mailOptions = {
        from: '"Romándi Vadászház Klinik" <romandi.klinik@gmail.com>',
        to: to,
        subject: "Sikeres regisztráció - Romándi Vadászház Klinik",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2c3e50; text-align: center;">Üdvözlünk nálunk!</h2>
                <hr>
                <p>Kedves <strong>${userName}</strong>,</p>
                <p>Köszönjük, hogy regisztráltál a <strong>Romándi Vadászház Klinik</strong> online rendszerébe.</p>
                <p>Mostantól kényelmesen foglalhatsz időpontot szakrendeléseinkre.</p>
                <br>
                <div style="text-align: center;">
                    <a href="https://romandi-vadaszhaz-klinik-frontend-4.vercel.app" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Klinik :)</a>
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sikeresen elküldve:", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Nodemailer hiba:", error.message);
        // Ha itt is 'Missing credentials' van, akkor a változó üresen jut el ide
        return false;
    }
};