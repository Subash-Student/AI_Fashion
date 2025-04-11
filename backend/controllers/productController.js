import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import userModel from "../models/userModel.js"


// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
      const { productId,} = req.body;

     const id = req.body.userId;

      const user = await userModel.findById(id);
      const product = await productModel.findById(productId);
  
      if (user && product) {
        const isAlreadyPresent = user.recentlyViewed.some(
          (item) => item._id.toString() === productId
        );
  
        if (!isAlreadyPresent) {
          user.recentlyViewed.push(product); // Push only ID, not full product object
          await user.save();
        }
  
        res.json({ success: true, product });
      } else {
        res.json({ success: false, message: "Product or User Not Found" });
      }
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };

  


const handleWishlist = async (req, res) => {
  const { productId, userId } = req.body
  const isWishlist = req.params.isWishlist === 'add' 

  try {
    const user = await userModel.findById(userId)
    const product = await productModel.findById(productId)

    if (!user || !product) {
      return res.status(404).json({ success: false, message: 'User or Product not found' })
    }

    if (isWishlist) {
     
      const alreadyInWishlist = user.wishlist.includes(productId)
      if (!alreadyInWishlist) {
        const { _id, name, price, image, category, subCategory, description, sizes } = product;
        user.wishlist.push({ _id, name, price, image, category, subCategory, description, sizes });
        await user.save()
        return res.status(200).json({ success: true, message: 'Product added to wishlist' })
      } else {
        return res.status(200).json({ success: true, message: 'Product already in wishlist' })
      }
    } else {
      
      user.wishlist = user.wishlist.filter(
        item => item._id.toString() !== productId
      )
      await user.save()
      
      return res.status(200).json({ success: true, message: 'Product removed from wishlist' })
      
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

export default handleWishlist


export { listProducts, addProduct, removeProduct, singleProduct,handleWishlist }