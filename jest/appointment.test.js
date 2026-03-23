import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';

// 🔥 AUTH MOCK - A bejelentkezett felhasználót szimuláljuk
jest.unstable_mockModule('../middleware/authMiddleware.js', () => ({
    protect: (req, res, next) => {
        req.user = global.testUser;
        next();
    },
    admin: (req, res, next) => next()
}));

// 🔥 EMAIL MOCK - Megakadályozzuk a tényleges levélküldést teszt alatt
jest.unstable_mockModule('../mail/mail.js', () => ({
    sendBookEmail: jest.fn().mockResolvedValue(true),
    sendDeleteEmail: jest.fn().mockResolvedValue(true),
    sendModifyEmail: jest.fn().mockResolvedValue(true),
    sendUpdateEmail: jest.fn().mockResolvedValue(true),
    sendCancelEmail: jest.fn().mockResolvedValue(true)
}));

const { default: appointmentRoutes } = await import('../routes/appointmentRoutes.js');
import { connectDB, dropDB, dropCollections } from './setup.js';
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import User from '../models/User.js';
import Service from '../models/Service.js';

const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);

describe('Appointment Routes (Klinikai tesztek)', () => {
    let doctor, patient, service;
    const validPassword = 'Password123'; // Megfelel a sémának (8+ karakter, betű, szám)

    beforeAll(async () => {
        await connectDB();
    });

    beforeEach(async () => {
        await dropCollections();

        // 1. DOKTOR LÉTREHOZÁSA
        // A sémád szerint orvosnak nem kötelező a TAJ és a lakcím
        doctor = await User.create({
            name: 'Dr. Teszt Elek',
            email: 'doc@test.com',
            password: validPassword,
            role: 'DOCTOR',
            specialization: 'Kardiológia',
            gender: 'MALE',
            birthDate: '1975-10-10',
            phone: '+36301112233' 
        });

        // 2. PÁCIENS LÉTREHOZÁSA
        // Itt fontos a 9 jegyű TAJ és a "1234 Város..." formátumú lakcím!
        patient = await User.create({
            name: 'Beteg Béla',
            email: 'patient@test.com',
            password: validPassword,
            role: 'PATIENT',
            gender: 'MALE',
            birthDate: '1990-01-01',
            phone: '06205556677',
            tajNumber: '123456789',
            address: '1011 Budapest, Fő utca 1.'
        });

        // 3. SZOLGÁLTATÁS LÉTREHOZÁSA (Minden kötelező mezővel)
        service = await Service.create({
            doctor_id: doctor._id,
            topic: 'Szívultrahang',
            description: 'Komplex kardiológiai ultrahangos vizsgálat.',
            location: '102-es vizsgáló',
            price: '15000' // A sémádban Stringként szerepel!
        });

        // 4. ORVOSI ELÉRHETŐSÉG LÉTREHOZÁSA
        await Availability.create({
            doctor: doctor._id,
            dayOfWeek: 'Csütörtök',
            startTime: '09:00',
            endTime: '12:00',
            isActive: true
        });
    });

    afterAll(async () => {
        await dropDB();
    });

    // --- TESZTEK ---

    it('✅ Sikeres foglalás (Valid időpont: Csütörtök 10:00)', async () => {
        global.testUser = patient;
        const res = await request(app)
            .post('/api/appointments')
            .send({
                doctor_id: doctor._id,
                service_id: service._id,
                startTime: '2026-03-19T10:00:00+01:00' // Jövőbeli időpont!
            });

        expect(res.statusCode).toBe(201);
    });

    it('❌ Hiba: Az orvos nem rendel ezen a napon (Péntek)', async () => {
        global.testUser = patient;
        const res = await request(app)
            .post('/api/appointments')
            .send({
                doctor_id: doctor._id,
                service_id: service._id,
                startTime: '2026-03-20T10:00:00+01:00'
            });

        expect(res.statusCode).toBe(400);
    });

    it('❌ Hiba: Időpont a rendelési időn kívül (08:00)', async () => {
        global.testUser = patient;
        const res = await request(app)
            .post('/api/appointments')
            .send({
                doctor_id: doctor._id,
                service_id: service._id,
                startTime: '2026-03-19T08:00:00+01:00'
            });

        expect(res.statusCode).toBe(400);
    });

    it('❌ Hiba: Ütközés - Az időpont már foglalt', async () => {
        global.testUser = patient;
        // Előre lefoglalunk egyet
        await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: service._id,
            startTime: new Date('2026-03-19T11:00:00+01:00')
        });

        const res = await request(app)
            .post('/api/appointments')
            .send({
                doctor_id: doctor._id,
                service_id: service._id,
                startTime: '2026-03-19T11:00:00+01:00'
            });

        expect(res.statusCode).toBe(400);
    });

    it('✅ Páciens csak a saját foglalásait látja', async () => {
        global.testUser = patient;
        await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: service._id,
            startTime: new Date('2026-03-26T10:00:00+01:00')
        });

        const res = await request(app).get('/api/appointments/my');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('✅ Orvos módosít időpontot -> PROPOSED státusz', async () => {
        global.testUser = doctor;
        const apt = await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: service._id,
            startTime: new Date('2026-04-02T09:00:00+01:00')
        });

        const res = await request(app)
            .put(`/api/appointments/${apt._id}`)
            .send({ startTime: '2026-04-02T10:30:00+01:00' });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('PROPOSED');
    });

    it('❌ Hiba: Idegen páciens nem férhet hozzá más időpontjához', async () => {
        const otherUser = await User.create({
            name: 'Idegen Páciens',
            email: 'other@test.com',
            password: validPassword,
            role: 'PATIENT',
            gender: 'FEMALE',
            birthDate: '1988-12-12',
            phone: '06709998877',
            tajNumber: '987654321',
            address: '2000 Szentendre, Alma utca 10.'
        });

        global.testUser = otherUser;
        const apt = await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: service._id,
            startTime: new Date('2026-04-09T09:00:00+01:00')
        });

        const res = await request(app)
            .put(`/api/appointments/${apt._id}`)
            .send({ status: 'CANCELLED' });

        expect(res.statusCode).toBe(403);
    });
});