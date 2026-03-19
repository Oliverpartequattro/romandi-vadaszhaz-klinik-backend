import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

// Útvonalak meghatározása
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
const doctorImagePath = path.join(__dirname, '../assets/exotic_doctor.png'); 

export const generateRecordPDF = (res, record) => {
    // Romándi Vadászház Színpaletta
    const colors = {
        background: '#36483d', // Mély vadászzöld
        card: '#6b4a2d',       // Barna (másodlagos)
        textGold: '#bf944a',   // Arany betűszín
        white: '#ffffff'
    };

    const doc = new PDFDocument({ 
        margin: 0, 
        size: 'A4',
        bufferPages: true 
    });

    doc.pipe(res);

    // Betűtípus beállítása
    try {
        doc.font(fontPath);
    } catch (err) {
        console.error("❌ Betűtípus hiba:", err.message);
    }

    // --- 1. TELJES OLDAL HÁTTERE ---
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

    // --- 2. FEJLÉC ÉS DOKTOR KÉP ---
    try {
        doc.image(doctorImagePath, 50, 40, { width: 200 });
    } catch (err) {
        doc.rect(50, 40, 90, 90).stroke(colors.textGold);
    }

    doc.fillColor(colors.textGold);
    doc.fontSize(24).text('ROMÁNDI VADÁSZHÁZ KLINIK', 160, 65, { align: 'left' });
    doc.fontSize(10).text('HIVATALOS ORVOSI LELET', 160, 95, { characterSpacing: 2 });

    // Díszítő vonal (Arany)
    doc.rect(50, 140, 500, 2).fill(colors.textGold);

    // --- 3. ADATOK SZEKCIÓ (Barna kártyák) ---
    const startY = 170;

    // Páciens kártya
    doc.rect(50, startY, 240, 100).fill(colors.card);
    doc.fillColor(colors.textGold).fontSize(12).text('PÁCIENS ADATAI', 60, startY + 10);
    doc.fillColor(colors.white).fontSize(11);
    doc.text(`Név: ${record.patient?.name}`, 65, startY + 35);
    doc.text(`TAJ: ${record.patient?.tajNumber}`);
    doc.text(`Email: ${record.patient?.email}`);

    // Orvos kártya
    doc.rect(310, startY, 240, 100).fill(colors.card);
    doc.fillColor(colors.textGold).fontSize(12).text('KEZELŐORVOS', 320, startY + 10);
    doc.fillColor(colors.white).fontSize(11);
    doc.text(`${record.doctor?.name}`, 325, startY + 35);
    doc.text(`Specializáció: ${record.doctor?.specialization}`);
    doc.text(`Email: ${record.doctor?.email}`);
    doc.text(`Telefonszám: ${record.doctor?.phone}`);

    // --- 4. VIZSGÁLAT RÉSZLETEI (Tördelt verzió) ---
    const detailY = 290;
    
    const examDate = record.appointment_id?.startTime 
        ? new Date(record.appointment_id.startTime).toLocaleString('hu-HU')
        : new Date(record.createdAt).toLocaleString('hu-HU');

    doc.fillColor(colors.textGold).fontSize(14).text('VIZSGÁLAT RÉSZLETEI', 50, detailY);
    
    // Megnöveltük a kártya magasságát (40 -> 60), hogy elférjen a két sor
    doc.rect(50, detailY + 20, 500, 60).fill(colors.card);
    doc.fillColor(colors.white).fontSize(11);
    
    // Szétbontva két sorra:
    doc.text(`Időpont: ${examDate}`, 65, detailY + 33);
    doc.text(`Szolgáltatás: ${record.service?.topic || 'Általános vizsgálat'}`, 65, detailY + 50);

    // --- 5. ORVOSI VÉLEMÉNY ---
    const opinionY = 380; // Kicsit lejjebb toltuk az előző szekció növekedése miatt
    doc.fillColor(colors.textGold).fontSize(14).text('ORVOSI VÉLEMÉNY ÉS DIAGNÓZIS', 50, opinionY);
    
    doc.rect(50, opinionY + 20, 500, 250).fill(colors.card);
    doc.fillColor(colors.white).fontSize(12);
    doc.text(record.description || 'Nincs megadott leírás.', 70, opinionY + 45, {
        width: 460,
        align: 'justify',
        lineGap: 5
    });

    // --- 6. LÁBLÉC ---
    const footerY = doc.page.height - 60;
    doc.rect(50, footerY, 500, 1).fill(colors.textGold);
    doc.fillColor(colors.textGold).fontSize(8).text(
        'Ez a dokumentum a Romándi Vadászház Klinik digitális rendszerében készült. Hiteles másolat.',
        50, footerY + 15, { align: 'center' }
    );
    doc.text(`Generálva: ${new Date().toLocaleString('hu-HU')}`, { align: 'center' });

    doc.end();
};