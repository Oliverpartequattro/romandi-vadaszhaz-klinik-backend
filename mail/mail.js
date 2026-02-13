import nodemailer from "nodemailer";

// Segédfüggvény a transporter létrehozásához (hogy ne ismételjük a kódot)
const getTransporter = () => {
    if (!process.env.EMAIL_PASS) {
        console.error("❌ KRITIKUS HIBA: Az EMAIL_PASS környezeti változó nem található!");
        return null;
    }
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "romandi.klinik@gmail.com",
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * 1. ÜDVÖZLŐ EMAIL (Regisztrációkor)
 */
export const sendWelcomeEmail = async (to, userName) => {
    const transporter = getTransporter();
    if (!transporter) return false;

    const mailOptions = {
        from: '"Romándi Vadászház Klinik" <romandi.klinik@gmail.com>',
        to,
        subject: "Sikeres regisztráció - Romándi Vadászház Klinik",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2c3e50; text-align: center;">Üdvözlünk nálunk!</h2>
                <hr>
                <p>Kedves <strong>${userName}</strong>,</p>
                <p>Köszönjük, hogy regisztráltál a <strong>Romándi Vadászház Klinik</strong> online rendszerébe.</p>
                <p>Mostantól kényelmesen foglalhatsz időpontot szakrendeléseinkre és megtekintheted leleteidet.</p>
                <br>
                <div style="text-align: center;">
                    <a href="https://romandi-vadaszhaz-klinik-frontend-4.vercel.app" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Belépés a fiókomba</a>
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Üdvözlő email elküldve:", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Hiba:", error.message);
        return false;
    }
};

/**
 * 2. TÖRLÉSI ÉRTESÍTŐ (Fiók törlésekor)
 */
export const sendDeleteEmail = async (to, userName) => {
    const transporter = getTransporter();
    if (!transporter) return false;

    const mailOptions = {
        from: '"Romándi Vadászház Klinik" <romandi.klinik@gmail.com>',
        to,
        subject: "Fiók törlése - Romándi Vadászház Klinik",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #e74c3c; text-align: center;">Sajnáljuk, hogy elmész!</h2>
                <hr>
                <p>Kedves <strong>${userName}</strong>,</p>
                <p>Ezúton értesítünk, hogy a <strong>Romándi Vadászház Klinik</strong> rendszerében regisztrált fiókod és adataid sikeresen törlésre kerültek.</p>
                <p>Reméljük, a jövőben még találkozunk!</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Törlési email elküldve");
        return true;
    } catch (error) {
        console.error("❌ Hiba:", error.message);
        return false;
    }
};

/**
 * 3. ADATMODOSÍTÁSI ÉRTESÍTŐ
 */
export const sendModifyEmail = async (to, userName) => {
    const transporter = getTransporter();
    if (!transporter) return false;

    const mailOptions = {
        from: '"Romándi Vadászház Klinik" <romandi.klinik@gmail.com>',
        to,
        subject: "Profil adatok módosítása - Romándi Vadászház Klinik",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #f39c12; text-align: center;">Adatváltozás történt</h2>
                <hr>
                <p>Kedves <strong>${userName}</strong>,</p>
                <p>Értesítünk, hogy a profiladataidat sikeresen módosítottad a rendszerünkben.</p>
                <p>Ha nem te végezted a módosítást, kérjük, haladéktalanul vedd fel velünk a kapcsolatot!</p>
                <div style="text-align: center;">
                    <a href="https://romandi-vadaszhaz-klinik-frontend-4.vercel.app" style="background-color: #cc2e2e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">AZONNALI BEAVATKOZÁS</a>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Módosítási email elküldve");
        return true;
    } catch (error) {
        console.error("❌ Hiba:", error.message);
        return false;
    }
};

/**
 * 4. IDŐPONTFOGLALÁSI ÉRTESÍTŐ (Páciensnek)
 */
export const sendBookEmail = async (to, userName, date, service, doctor) => {
    const transporter = getTransporter();
    if (!transporter) return false;

    const mailOptions = {
        from: '"Romándi Vadászház Klinik" <romandi.klinik@gmail.com>',
        to,
        subject: "Időpontfoglalás rögzítve - Romándi Vadászház Klinik",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2ecc71; text-align: center;">Sikeres foglalás!</h2>
                <hr>
                <p>Kedves <strong>${userName}</strong>,</p>
                <p>Rendszerünk rögzítette az új időpontfoglalásodat.</p>
                <p><strong>Orvos:</strong> ${doctor || 'Hamarosan pontosítva'}</p>
                <p><strong>Vizsgálat:</strong> ${service || 'Hamarosan pontosítva'}</p>
                <p><strong>Időpont:</strong> ${date || 'Hamarosan pontosítva'}</p>
                <p>Kérjük, érkezz 10 perccel a megadott időpont előtt.</p>
                <br>
                <div style="text-align: center;">
                    <a href="https://romandi-vadaszhaz-klinik-frontend-4.vercel.app" style="background-color: #2ecc71; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Időpontjaim megtekintése</a>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Foglalási email elküldve");
        return true;
    } catch (error) {
        console.error("❌ Hiba:", error.message);
        return false;
    }
};

/**
 * 5. ORVOSI VÁLASZ / LELET ÉRTESÍTŐ
 */
export const sendDoctorResponseEmail = async (to, userName) => {
    const transporter = getTransporter();
    if (!transporter) return false;

    const mailOptions = {
        from: '"Romándi Vadászház Klinik" <romandi.klinik@gmail.com>',
        to,
        subject: "Új egészségügyi dokumentum érkezett - Romándi Vadászház Klinik",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #34495e; text-align: center;">Új lelet érkezett</h2>
                <hr>
                <p>Kedves <strong>${userName}</strong>,</p>
                <p>Értesítünk, hogy az orvosod frissítette a kórtörténetedet vagy új leletet töltött fel a rendszerbe.</p>
                <p>A dokumentumot bejelentkezés után a "Kórtörténet" menüpont alatt találod meg.</p>
                <br>
                <div style="text-align: center;">
                    <a href="https://romandi-vadaszhaz-klinik-frontend-4.vercel.app" style="background-color: #34495e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Leletek megtekintése</a>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Orvosi válasz email elküldve");
        return true;
    } catch (error) {
        console.error("❌ Hiba:", error.message);
        return false;
    }
};