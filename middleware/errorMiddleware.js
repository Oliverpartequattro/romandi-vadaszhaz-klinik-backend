class ErrorResponse extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Szerver hiba történt';
    let errors = err.errors || null;

    // --- MONGOOSE VALIDÁCIÓS HIBA KEZELÉSE ---
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = "Validációs hiba"; // Pontosan ez lesz a fő üzenet
        errors = {};
        
        // Összegyűjtjük a mezőket és a hozzájuk tartozó üzeneteket
        Object.values(err.errors).forEach(val => {
            errors[val.path] = val.message;
        });
    }

    // --- MONGOOSE DUPLIKÁLT KULCS (pl. email) ---
    if (err.code === 11000) {
        statusCode = 400;
        message = "Validációs hiba";
        const field = Object.keys(err.keyValue)[0];
        errors = { [field]: `Ez a(z) ${field} már foglalt!` };
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors
    });
};

export { ErrorResponse, errorHandler };