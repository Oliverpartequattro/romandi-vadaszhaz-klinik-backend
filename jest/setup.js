import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo;

// Tesztek előtt elindítjuk a memóriában futó DB-t
export const connectDB = async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
};

// Tesztek után leállítjuk és töröljük
export const dropDB = async () => {
    if (mongo) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongo.stop();
    }
};

// Minden teszt között kitakarítjuk a kollekciókat
export const dropCollections = async () => {
    if (mongo) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }
};