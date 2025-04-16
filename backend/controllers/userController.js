import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;

       

        if (!(/^\d{10}$/.test(phone))) {
            return res.json({ success: false, message: "Please enter a valid  phone number" });
        } 

        // Password validation
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 chars)" });
        }

        // Find user by   phone
        const user = await userModel.findOne({ phone });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token and send success
        const token = createToken(user._id);
        res.json({
            success: true,
            token,
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, phone, password } = req.body;

        
        if (!(/^\d{10}$/.test(phone))) {
            return res.json({ success: false, message: "Please enter a valid   phone number" });
        } 

        // Password validation
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 chars)" });
        }
        // Check if user already exists
        const existingUser = await userModel.findOne({ phone });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new userModel({
            name,
            phone,
            password: hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({
            success: true,
            token,
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const getUserData = async (req, res) => {
    try {
        const id = req.body.userId ;

        const user = await userModel.findById(id);

        if(user){
            res.json({success:true,user:user})
        }else{
        res.json({ success: false, message: "User Not Found" })

        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


const editUserDetails = async (req, res) => {
    const { userId, name,  phone } = req.body;
  
    // Basic field presence check
    if (!userId || !name || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
  
    // Name validation (at least 2 characters)
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Invalid name' });
    }
  
   
  
    // Phone number validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(Number(phone))) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }
  
    try {
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { name,  phone },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      return res.status(200).json({
        success: true,
        message: 'User details updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Edit user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later.',
      });
    }
  };
  


const editUserAddressByPincode = async (req, res) => {
  try {
    const userId = req.body.userId; 
    const { address } = req.body;

    
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { address: address },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Address updated", address: address });
  } catch (error) {
    console.error("Error updating address by pincode:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};




export const resetPassword = async(req,res)=>{

    const{newPassword,phone} = req.body;
  
        try {
            const   user = await userModel.findOne({phone});

            const salt = await bcrypt.genSalt(10);
            const newHashedPassword =  await bcrypt.hash(newPassword,salt);

            user.password = newHashedPassword;
            
            await user.save();
            
            res.json({success:true,message:"Your password has been updated successfully !",data:user})
            
            
        } catch (error) {
            console.log(error);
            return res.json({success:false,message:"Failed To Update Password !"});

        }
    
}




export { loginUser, registerUser, adminLogin,getUserData,editUserDetails,editUserAddressByPincode }


