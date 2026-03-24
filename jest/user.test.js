import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';

// --- MOCKOK ---
process.env.JWT_SECRET = 'teszt_titok_123';
// Auth Middleware Mock
jest.unstable_mockModule('../middleware/authMiddleware.js', () => ({
    protect: (req, res, next) => {
        req.user = global.testUser;
        next();
    },
    admin: (req, res, next) => {
        if (global.testUser?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Nincs admin jogosultság' });
        }
        next();
    },
    doctorOrAdmin: (req, res, next) => {
        if (['ADMIN', 'DOCTOR'].includes(global.testUser?.role)) return next();
        res.status(403).json({ message: 'Nincs jogosultság' });
    }
}));

// Mail Mock
jest.unstable_mockModule('../mail/mail.js', () => ({
    sendWelcomeEmail: jest.fn(),
    sendDeleteEmail: jest.fn(),
    sendModifyEmail: jest.fn(),
    sendResetCodeEmail: jest.fn()
}));

const { default: userRoutes } = await import('../routes/userRoutes.js');
import { connectDB, dropDB, dropCollections } from './setup.js';
import User from '../models/User.js';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes & Auth (Klinikai tesztek)', () => {
    let adminUser, patientUser, doctorUser;
    const commonPassword = 'Password123';

    beforeAll(async () => await connectDB());
    afterAll(async () => await dropDB());

    beforeEach(async () => {
        await dropCollections();

        // Admin a listázáshoz
        adminUser = await User.create({
            name: 'Fő Admin',
            email: 'admin@klinika.hu',
            password: commonPassword,
            role: 'ADMIN',
            phone: '06301112233',
            birthDate: '1980-01-01',
            gender: 'MALE'
        });

        // Páciens a profil tesztekhez
        patientUser = await User.create({
            name: 'Teszt Páciens',
            email: 'patient@teszt.hu',
            password: commonPassword,
            role: 'PATIENT',
            phone: '06201112233',
            birthDate: '1995-05-05',
            gender: 'FEMALE',
            tajNumber: '111222333',
            address: '1111 Budapest, Teszt utca 1.'
        });
    });

    // --- 1. REGISZTRÁCIÓ ÉS LOGIN ---

    it('✅ POST /register - Sikeres regisztráció (Páciens)', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({
                name: 'Új Felhasználó',
                email: 'newuser@teszt.hu',
                password: 'NewPassword123',
                phone: '06701112233',
                birthDate: '2000-01-01',
                gender: 'MALE',
                role: 'PATIENT',
                tajNumber: '999888777',
                address: '2222 Debrecen, Alma utca 5.'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('token');
    });

    it('❌ POST /register - Hiba: Gyenge jelszó (nincs benne szám)', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({
                name: 'Hibás Jelszó',
                email: 'error@teszt.hu',
                password: 'csakbetuk',
                phone: '06701112233',
                birthDate: '1990-01-01',
                gender: 'MALE'
            });

        expect(res.statusCode).toBe(400); // Mongoose ValidationError
    });

    it('✅ POST /login - Sikeres belépés', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: 'patient@teszt.hu',
                password: commonPassword
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.name).toBe('Teszt Páciens');
    });

    // --- 2. PROFIL MŰVELETEK ---

    it('✅ GET /profile - Saját profil lekérése', async () => {
        global.testUser = patientUser;
        const res = await request(app).get('/api/users/profile');

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(patientUser.email);
    });

    it('✅ PUT /profile - Név és telefonszám frissítése', async () => {
        global.testUser = patientUser;
        const res = await request(app)
            .put('/api/users/profile')
            .send({ name: 'Módosított Név', phone: '06309998877' });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Módosított Név');
    });

    // --- 3. ADMIN FUNKCIÓK ---

    it('✅ GET / - Admin látja az összes felhasználót', async () => {
        global.testUser = adminUser;
        const res = await request(app).get('/api/users');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('❌ GET / - Páciens nem listázhat felhasználókat (403)', async () => {
        global.testUser = patientUser;
        const res = await request(app).get('/api/users');

        expect(res.statusCode).toBe(403);
    });

    // --- 4. TÖRLÉS ---

    it('✅ DELETE /:id - Admin törölhet felhasználót', async () => {
        global.testUser = adminUser;
        const res = await request(app).delete(`/api/users/${patientUser._id}`);

        expect(res.statusCode).toBe(200);
        const findUser = await User.findById(patientUser._id);
        expect(findUser).toBeNull();
    });

    // --- 5. JELSZÓ VISSZAÁLLÍTÁS ---

    it('✅ POST /forgot-password - Kód generálás', async () => {
        const res = await request(app)
            .post('/api/users/forgot-password')
            .send({ email: 'patient@teszt.hu' });

        expect(res.statusCode).toBe(200);
        const updatedUser = await User.findOne({ email: 'patient@teszt.hu' });
        expect(updatedUser.resetPasswordCode).toBeDefined();
    });

    // --- 6. STATISZTIKA ---

    it('✅ GET /stats/me - Páciens statisztika lekérése', async () => {
        global.testUser = patientUser;
        const res = await request(app).get('/api/users/stats/me');

        expect(res.statusCode).toBe(200);
        expect(res.body.stats.type).toBe('Personal Health Summary');
    });
});