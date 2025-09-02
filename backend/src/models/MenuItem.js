import mongoose from 'mongoose';


const choiceSchema = new mongoose.Schema({
label: String,
priceDelta: { type: Number, default: 0 }
}, { _id: false });


const optionSchema = new mongoose.Schema({
name: String,
choices: [choiceSchema],
required: { type: Boolean, default: false },
multiSelect: { type: Boolean, default: false }
}, { _id: false });


const menuItemSchema = new mongoose.Schema({
name: String,
description: String,
price: Number,
category: String,
imageUrl: String,
veg: Boolean,
spiceLevels: [String],
options: [optionSchema],
active: { type: Boolean, default: true }
}, { timestamps: true });


export default mongoose.model('MenuItem', menuItemSchema);