import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB, dropDB, dropCollections } from './setup.js';
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import { jest } from '@jest/globals';

// 🔥 AUTH MOCK (ne kelljen tokenezni)
jest.unstable_mockModule('../middleware/authMiddleware.js', () => ({
    protect: (req, res, next) => {
        req.user = global.testUser;
        next();
    },
    admin: (req, res, next) => next()
}));

// 🔥 EMAIL MOCK
jest.unstable_mockModule('../mail/mail.js', () => ({
    sendBookEmail: jest.fn().mockResolvedValue(true)
}));

// router betöltés CSAK mock után!
const { default: appointmentRoutes } = await import('../routes/appointmentRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);

describe('Appointment Routes (egyszerű)', () => {

    let doctor, patient, service;

    beforeAll(async () => {
        await connectDB();
    });

    beforeEach(async () => {
        await dropCollections();

        doctor = await User.create({
            name: 'Doc',
            email: 'doc@test.com',
            password: '123',
            role: 'DOCTOR'
        });

        patient = await User.create({
            name: 'Pat',
            email: 'pat@test.com',
            password: '123',
            role: 'PATIENT'
        });

        service = await Service.create({
            topic: 'Vizsgálat',
            price: 10000,
            doctor_id: doctor._id
        });

        // Csütörtök 09:00-12:00
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

    // =========================
    // POST
    // =========================

    it('✅ sikeres foglalás', async () => {
        global.testUser = patient;

        const res = await request(app)
            .post('/api/appointments')
            .send({
                doctor_id: doctor._id,
                service_id: service._id,
                startTime: '2026-03-19T10:00:00+01:00'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toBeDefined();
    });

    it('❌ nincs rendelés azon a napon', async () => {
        global.testUser = patient;

        const res = await request(app)
            .post('/api/appointments')
            .send({
                doctor_id: doctor._id,
                service_id: service._id,
                startTime: '2026-03-20T10:00:00+01:00' // péntek
            });

        expect(res.statusCode).toBe(400);
    });

    it('❌ időn kívül', async () => {
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

    it('❌ ütközés', async () => {
        global.testUser = patient;

        const date = new Date('2026-03-19T10:00:00+01:00');

        await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: service._id,
            startTime: date
        });

        const res = await request(app)
            .post('/api/appointments')
            .send({
                doctor_id: doctor._id,
                service_id: service._id,
                startTime: '2026-03-19T10:00:00+01:00'
            });

        expect(res.statusCode).toBe(400);
    });

    // =========================
    // GET /my
    // =========================

    it('✅ páciens csak sajátot lát', async () => {
        global.testUser = patient;

        await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: service._id,
            startTime: new Date(Date.now() + 1000000)
        });

        const res = await request(app)
            .get('/api/appointments/my');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    // =========================
    // PUT
    // =========================

    it('✅ orvos módosít -> PROPOSED', async () => {
        global.testUser = doctor;

        const appointment = await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: service._id,
            startTime: new Date(Date.now() + 1000000)
        });

        const res = await request(app)
            .put(`/api/appointments/${appointment._id}`)
            .send({
                startTime: new Date(Date.now() + 2000000)
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('PROPOSED');
    });

    it('❌ idegen user nem módosíthat', async () => {
        const otherUser = await User.create({
            name: 'Other',
            email: 'other@test.com',
            password: '123',
            role: 'PATIENT'
        });

        global.testUser = otherUser;

        const appointment = await Appointment.create({
            doctor_id: doctor._id,
            patient_id: patient._id,
            service_id: service._id,
            startTime: new Date(Date.now() + 1000000)
        });

        const res = await request(app)
            .put(`/api/appointments/${appointment._id}`)
            .send({ status: 'CANCELLED' });

        expect(res.statusCode).toBe(403);
    });

});