import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

// Mivel ES modult használsz (import), így kell meghatározni az útvonalat
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateRecordPDF = (res, record) => {
    // A letöltött Google Font elérési útja
    const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');

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
        // Ha nem találja, a rendszer alapértelmezettre vált, de az ékezet rossz lesz
    }

    // Fejléc
    doc.fontSize(20).text('ROMÁNDI VADÁSZHÁZ KLINIK', { align: 'center' });
    doc.fontSize(10).text('Hivatalos Orvosi Lelet', { align: 'center' });
    doc.moveDown();
    doc.rect(50, doc.y, 500, 2).fill('#2c3e50');
    doc.moveDown(2);

    // Adatok szekció
    doc.fontSize(14).fillColor('#2c3e50').text('Páciens adatai:');
    doc.fontSize(12).fillColor('black').text(`Név: ${record.patient.name}`);
    doc.text(`TAJ szám: ${record.patient.tajNumber}`);
    doc.text(`Email: ${record.patient.email}`);
    doc.moveDown();

    doc.fontSize(14).fillColor('#2c3e50').text('Kezelőorvos adatai:');
    doc.fontSize(12).fillColor('black').text(`Név: ${record.doctor.name}`);
    doc.text(`Szakterület: ${record.doctor.specialization}`);
    doc.moveDown();

    doc.fontSize(14).fillColor('#2c3e50').text('Vizsgálat részletei:');
    doc.fontSize(12).fillColor('black').text(`Időpont: ${new Date(record.createdAt).toLocaleString('hu-HU')}`);
    doc.text(`Szolgáltatás: ${record.service?.topic || 'Általános vizsgálat'}`);
    doc.moveDown();

    // Diagnózis / Leírás
    doc.rect(50, doc.y, 500, 150).stroke('#bdc3c7');
    const currentY = doc.y;
    doc.fontSize(14).fillColor('#2c3e50').text(' Orvosi vélemény / Leírás:', 55, currentY + 10);
    doc.fontSize(11).fillColor('black').text(record.description, 60, currentY + 30, { width: 480 });

    // Lábléc
    const bottom = doc.page.height - 100;
    doc.fontSize(10).fillColor('grey').text('Ez a dokumentum elektronikusan készült és aláírás nélkül is hiteles.', 50, bottom, { align: 'center' });
    doc.text(`Generálva: ${new Date().toLocaleString('hu-HU')}`, { align: 'center' });

    doc.end();
};