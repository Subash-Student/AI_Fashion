import axios from 'axios';
import otpModel from "../models/otpModel.js";
import dotenv from "dotenv";
dotenv.config();



const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();


const twoFactorApiKey = process.env.twoFactorApiKey;

export const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone is required" });

  const otp = generateOTP();

  try {
    // Delete previous OTPs for that number
    await otpModel.deleteMany({ phone });

    // Save new OTP to MongoDB
    await new otpModel({ phone, otp }).save();

    // Format phone number with country code
    // const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    // 2Factor Voice OTP API
    const apiUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/VOICE/${phone}/${otp}`;

    const response = await axios.get(apiUrl);

    if (response.data.Status === 'Success') {
      res.json({ success: true, message: "OTP sent via voice call" });
    } else {
      throw new Error(response.data.Details || 'OTP call failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "OTP call failed" });
  }
};



export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP are required" });
  }

  try {
    // Retrieve the stored OTP for the given phone number
    const record = await otpModel.findOne({ phone });

    if (!record) {
      return res.status(400).json({ success: false, message: "No OTP found for this number" });
    }

    // Compare the provided OTP with the stored one
    if (record.otp === otp) {
      // OTP is correct; delete it from the database
      await otpModel.deleteOne({ phone });
      return res.json({ success: true, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};
