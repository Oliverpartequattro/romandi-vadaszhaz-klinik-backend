/**
 * 1. AZ ESZKÖZ: Egyedi hibaosztály
 * Ezt fogod használni a kontrollerekben: throw new ErrorResponse("Üzenet", 400)
 */
class ErrorResponse extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors; // Opcionális: több hibaüzenetnek (pl. validációs lista)
    }
}

/**
 * 2. A KÖZPONT: Globális hibakezelő middleware
 */
const errorHandler = (err, req, res, next) => {
    // Alapértelmezett értékek (ha valami váratlan hiba történik)
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Szerver hiba történt';
    let errors = err.errors || null;

    // --- AUTOMATIKUS MONGOOSE KEZELÉS (hogy ne kelljen kézzel írnod) ---
    
    // Validációs hiba (amit a User.js-be írtál required/match/regex)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = "Adatbeviteli hiba történt";
        errors = {};
        Object.values(err.errors).forEach(val => {
            errors[val.path] = val.message;
        });
    }

    // Duplikált adat (pl. foglalt email)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = "Validációs hiba";
        errors = { [field]: `Ez a(z) ${field} már foglalt!` };
    }

    // --- VÁLASZ KÜLDÉSE A FRONTENDNEK ---
    res.status(statusCode).json({
        success: false,
        message: message, // Ez lesz az általános üzenet
        errors: errors,   // Ez pedig a konkrét mezőkhöz tartozó hiba (ha van)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

export { ErrorResponse, errorHandler };