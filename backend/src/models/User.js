import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
name: String,
email: { type: String, unique: true },
passwordHash: String,
role: { type: String, enum: ['admin','kitchen','staff'], required: true },
}, { timestamps: true });


export default mongoose.model('User', userSchema);