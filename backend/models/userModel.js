import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String,  unique: true },
    password: { type: String, unique: true },
    phone: { type: String, required: true },
    address: { type: String, default:""},
    cartData: { type: Object, default: {} },
    orders:  { type: Array, default: [] },
    recentlyViewed:  { type: Array, default: [] },
    wishlist: { type: Array, default: [] },
    orderStatus: [
        {
          orderId: String,
          statusUpdates: [
            {
              status: String,
              timestamp: Date,
            },
          ],
        },
      ],
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel