import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

// Mivel ES modult használsz (import), így kell meghatározni az útvonalat
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Képek és betűtípusok útvonala (Tégy egy megfelelő képet az assets mappába!)
const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
const doctorImagePath = path.join(__dirname, '../assets/exotic_doctor.webp'); // Trópusi doktor kép

export const generateRecordPDF = (res, record) => {
    const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
        bufferPages: true 
    });

    doc.pipe(res);

    // Betűtípus regisztrálása és beállítása
    try {
        doc.font(fontPath);
    } catch (err) {
        console.error("❌ Nem sikerült betölteni a betűtípust:", err.message);
    }

    // --- VIZUÁLIS ELEMEK ÉS HÁTTÉR ---
    
    // 1. Trópusi Háttér-vízjel (opcionális, ha van háttérképed)
    // doc.image('assets/jungle_pattern.png', 0, 0, { width: doc.page.width, opacity: 0.1 });

    // 2. A "Dizájnos Doktor" elhelyezése
    try {
        // A kért néger orvos sztetoszkóppal, trópusi környezetben
        doc.image(doctorImagePath, 50, 50, { width: 100, align: 'left' });
    } catch (err) {
        console.error("❌ Nem sikerült betölteni a doktor képét:", err.message);
        // Fallback: Egy egyszerű ikon vagy üres hely
        doc.rect(50, 50, 100, 100).stroke();
    }

    // --- FEJLÉC ÉS BRANDING ---
    doc.fillColor('#2c3e50'); // Sötétkék/szürke alapszín
    doc.fontSize(22).text('ROMÁNDI VADÁSZHÁZ KLINIK', 170, 60, { align: 'left' });
    doc.fontSize(12).text('Exotic Medical Center - Trópusi Gyógyászat', 170, 90, { align: 'left' });
    doc.moveDown(2);
    
    // Elválasztó vonal (egzotikusabb stílusban)
    doc.rect(50, 130, 500, 3).fill('#27ae60'); // Zöld szín a trópusi hangulathoz
    doc.moveDown(3);

    const currentY = doc.y;

    // --- ADATOK SZEKCIÓ (Dinamikus elrendezés) ---
    
    // Bal oszlop: Páciens adatai
    doc.fontSize(14).fillColor('#2c3e50').text('Páciens adatai:', 50, currentY);
    doc.fontSize(12).fillColor('black').text(`Név: ${record.patient.name}`, 55, currentY + 20);
    doc.text(`TAJ szám: ${record.patient.tajNumber}`);
    doc.text(`Email: ${record.patient.email}`);

    // Jobb oszlop: Kezelőorvos adatai
    doc.fontSize(14).fillColor('#2c3e50').text('Kezelőorvos adatai:', 300, currentY);
    doc.fontSize(12).fillColor('black').text(`Név: ${record.doctor.name}`, 305, currentY + 20);
    doc.text(`Szakterület: ${record.doctor.specialization}`);

    doc.moveDown(3);

    // --- ISSUE #1 MEGOLDÁSA: A VIZSGÁLAT VALÓDI IDŐPONTJA ---
    // Használjuk az appointment_id.startTime-t, ha van, különben a createdAt-et
    const examDate = record.appointment_id?.startTime 
        ? new Date(record.appointment_id.startTime).toLocaleString('hu-HU')
        : new Date(record.createdAt).toLocaleString('hu-HU');

    doc.fontSize(14).fillColor('#2c3e50').text('Vizsgálat részletei:');
    doc.fontSize(12).fillColor('black').text(`Időpont: ${examDate}`, { bold: true }); // Kiemelve
    doc.text(`Szolgáltatás: ${record.service?.topic || 'Általános vizsgálat'}`);
    doc.moveDown(2);

    // --- DIAGNÓZIS / LEÍRÁS (Keretezett) ---
    
    // Keret (zöld színnel)
    doc.rect(50, doc.y, 500, 180).stroke('#27ae60'); 
    
    // Cím
    const opinionY = doc.y;
    doc.fontSize(15).fillColor('#2c3e50').text(' Orvosi vélemény / Leírás:', 55, opinionY + 15);
    
    // Szöveg
    doc.fontSize(11).fillColor('black').text(record.description, 60, opinionY + 40, { 
        width: 480, 
        align: 'justify', // Igazított szöveg
        lineGap: 4 // Jobb olvashatóság
    });

    // --- LÁBLÉC ---
    const bottom = doc.page.height - 80;
    doc.rect(50, bottom - 10, 500, 1).fill('grey'); // Elválasztó vonal
    doc.fontSize(9).fillColor('grey').text('Ez a dokumentum elektronikusan készült, a Romándi Vadászház Klinik Exotic Medical Centerének hivatalos lelete.', 50, bottom, { align: 'center' });
    doc.text(`Generálva: ${new Date().toLocaleString('hu-HU')}`, { align: 'center' });

    doc.end();
};