import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, } 
  });


const otpModel = mongoose.models.otp || mongoose.model('otp',otpSchema)
export default otpModel;