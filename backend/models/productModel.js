import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: { type: Array, required: true },
  bestseller: { type: Boolean },
  date: { type: Number, required: true },
  reviews: [
    {
      userName: String,
      review: String,
      rating: Number,
      date: Date
    }
  ],
  averageRating: {
    type: Number,
    default: 0
  },
  brand: { type: String },
  material: { type: String },
  fitType: { type: String },
  pattern: { type: String },
  colorOptions: { type: String },
  occasion: { type: String },
  washCare: { type: String },
  inStock: { type: Boolean, default: true },
  secondryColor: { type: String },
  returnable: { type: Boolean, default: false },
  sleeveType: { type: String },
  neckType: { type: String }
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
