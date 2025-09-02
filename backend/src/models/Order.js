import mongoose from 'mongoose';


const orderItemSchema = new mongoose.Schema({
itemId: { type: mongoose.Types.ObjectId, ref: 'MenuItem' },
name: String,
basePrice: Number,
quantity: Number,
notes: String,
selectedOptions: {},
totalPrice: Number
}, { _id: false });


const orderSchema = new mongoose.Schema({
tableId: { type: mongoose.Types.ObjectId, ref: 'Table' },
tableCode: String,
status: { type: String, enum: ['PLACED','ACCEPTED','PREPARING','READY','SERVED','CANCELLED'], default: 'PLACED' },
items: [orderItemSchema],
subtotal: Number,
tax: Number,
serviceCharge: Number,
grandTotal: Number,
paymentStatus: { type: String, enum: ['UNPAID','PROCESSING','PAID','REFUNDED'], default: 'UNPAID' },
createdBy: { type: String, enum: ['customer','staff'], default: 'customer' }
}, { timestamps: true });


export default mongoose.model('Order', orderSchema);