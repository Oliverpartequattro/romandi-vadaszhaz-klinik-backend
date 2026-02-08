import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'mongodb+srv://ronczoliver:niggerek@cluster0.hmkrhja.mongodb.net/?appName=Cluster0';
const dbName = 'clinic';
const dataDir = path.join(__dirname, '../data');

// Files to upload
const files = [
  'appointments.jsonl',
  'doctors.jsonl',
  'patients.jsonl',
  'records.jsonl',
  'services.jsonl',
  'users.jsonl'
];

// Map file names to collection names
const fileToCollection = {
  'appointments.jsonl': 'appointments',
  'doctors.jsonl': 'doctors',
  'patients.jsonl': 'patients',
  'records.jsonl': 'records',
  'services.jsonl': 'services',
  'users.jsonl': 'users'
};

async function readJsonlFile(filePath) {
  const documents = [];
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        documents.push(JSON.parse(line));
      } catch (error) {
        console.error(`Error parsing line in ${path.basename(filePath)}: ${error.message}`);
      }
    }
  }

  return documents;
}

async function uploadData() {
  const client = new MongoClient(connectionString);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Upload each file
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const collectionName = fileToCollection[file];

      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }

      console.log(`\nProcessing: ${file}`);

      // Read JSONL file
      const documents = await readJsonlFile(filePath);

      if (documents.length === 0) {
        console.log(`No documents found in ${file}`);
        continue;
      }

      // Get collection
      const collection = db.collection(collectionName);

      // Clear existing data (optional - comment out if you want to preserve existing data)
      // await collection.deleteMany({});

      // Insert documents
      const result = await collection.insertMany(documents, { ordered: false });
      console.log(`✓ Uploaded ${result.insertedIds.length} documents to ${collectionName}`);
    }

    console.log('\n✓ All files uploaded successfully!');
  } catch (error) {
    console.error('Error uploading data:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

uploadData();
