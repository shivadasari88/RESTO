import mongoose from 'mongoose';


const paymentSchema = new mongoose.Schema({
orderId: { type: mongoose.Types.ObjectId, ref: 'Order' },
provider: String,
providerRef: String,
amount: Number,
currency: { type: String, default: 'INR' },
status: { type: String, enum: ['INITIATED','SUCCEEDED','FAILED','REFUNDED'], default: 'INITIATED' }
}, { timestamps: true });


export default mongoose.model('Payment', paymentSchema);