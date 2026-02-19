/**
 * Egyedi hibaosztály a kontrollerekben történő manuális hibaüzenetekhez
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Globális hibakezelő middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Logolás a szerver konzolra a fejlesztéshez
    console.error(`❌ HIBA ELKAPVA: ${err.message}`);

    // 1. Mongoose Rossz ID (CastError) - pl. /api/users/123 (ahol az id nem érvényes ObjectId)
    if (err.name === 'CastError') {
        const message = `Erőforrás nem található. Érvénytelen azonosító: ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // 2. Mongoose Duplikált mező (MongoError 11000) - pl. foglalt email cím
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `A(z) ${field} mező értéke már létezik az adatbázisban!`;
        error = new ErrorResponse(message, 400);
    }

    // 3. Mongoose Validációs hiba (ValidationError) - Regex, Required, Enum hiba
    if (err.name === 'ValidationError') {
        // Itt gyűjtjük össze a User modellben megadott egyedi hibaüzeneteket
        const validationErrors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
        
        // Itt rögtön visszatérünk a strukturált JSON-nel
        return res.status(400).json({
            success: false,
            message: "Adatbeviteli hiba történt",
            errors: validationErrors
        });
    }

    // Végső válasz összeállítása (vagy az egyedi ErrorResponse-ból, vagy 500-as hiba)
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Szerver hiba történt',
        // Stack trace (hiba helye) csak fejlesztői módban jelenik meg
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

// Exportáljuk mindkettőt: az osztályt a kontrollereknek, a middleware-t a server.js-nek
export { ErrorResponse, errorHandler };