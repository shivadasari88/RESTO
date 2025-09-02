import mongoose from 'mongoose';


export async function initDb() {
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI not set');
mongoose.set('strictQuery', true);
await mongoose.connect(uri, { dbName: 'qrresto' });
console.log('MongoDB connected');
}