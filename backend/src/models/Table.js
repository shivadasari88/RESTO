import mongoose from 'mongoose';


const tableSchema = new mongoose.Schema({
code: { type: String, unique: true, index: true },
seats: { type: Number, default: 4 },
activeOrderId: { type: mongoose.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });


export default mongoose.model('Table', tableSchema);