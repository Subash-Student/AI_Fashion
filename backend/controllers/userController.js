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
        const { contact, password } = req.body;

        let email = "";
        let phone = "";

        // Validate contact input
        if (validator.isEmail(contact)) {
            email = contact;
        } else if (/^\d{10}$/.test(contact)) {
            phone = contact;
        } else {
            return res.json({ success: false, message: "Please enter a valid email or phone number" });
        }

        // Password validation
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 chars)" });
        }

        // Find user by email or phone
        const user = email
            ? await userModel.findOne({ email })
            : await userModel.findOne({ phone });

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
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, contact, password } = req.body;

        let email = "";
        let phone = "";

        // Validate contact input
        if (validator.isEmail(contact)) {
            email = contact;
        } else if (/^\d{10}$/.test(contact)) {
            phone = contact;
        } else {
            return res.json({ success: false, message: "Please enter a valid email or phone number" });
        }

        // Password validation
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new userModel({
            name,
            email,
            phone,
            password: hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone
            }
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

export { loginUser, registerUser, adminLogin,getUserData }