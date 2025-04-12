import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import userModel from "../models/userModel.js"


// function for add product
const addProduct = async (req, res) => { 
  try {
      const {
          name,
          description,
          price,
          category,
          subCategory,
          sizes,
          bestseller,
          brand,
          material,
          fitType,
          pattern,
          colorOptions,
          occasion,
          washCare,
          inStock,
          secondryColor,
          returnable,
          sleeveType,
          neckType
      } = req.body;

      const image1 = req.files.image1 && req.files.image1[0];
      const image2 = req.files.image2 && req.files.image2[0];
      const image3 = req.files.image3 && req.files.image3[0];
      const image4 = req.files.image4 && req.files.image4[0];

      const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

      let imagesUrl = await Promise.all(
          images.map(async (item) => {
              let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
              return result.secure_url;
          })
      );

      const productData = {
          name,
          description,
          category,
          price: Number(price),
          subCategory,
          bestseller: bestseller === "true",
          sizes: JSON.parse(sizes),
          image: imagesUrl,
          date: Date.now(),
          brand,
          material,
          fitType,
          pattern,
          colorOptions,
          occasion,
          washCare,
          inStock: inStock === "true",
          secondryColor,
          returnable: returnable === "true",
          sleeveType,
          neckType
      };

      const product = new productModel(productData);
      await product.save();

      res.json({ success: true, message: "Product Added" });
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
};



// edit product
const updateProduct = async (req, res) => {
  try {
    const productId = req.body.id;
    if (!productId) return res.status(400).json({ success: false, message: "Product ID missing." });

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    // === Update fields ===
    const fields = [
      "name", "description", "price", "category", "subCategory", "bestseller", "sizes", "brand",
      "material", "fitType", "pattern", "colorOptions", "occasion", "washCare",
      "inStock", "secondryColor", "returnable", "sleeveType", "neckType"
    ];

    fields.forEach(field => {
      if (field in req.body) {
        if (field === "sizes") {
          product.sizes = JSON.parse(req.body.sizes);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    // === Handle Images ===
    const imageArray = [];
    for (let i = 1; i <= 4; i++) {
      const imageKey = `image${i}`;
      const file = req.files?.[imageKey]?.[0];

      if (file) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        imageArray.push(result.secure_url);
      } else if (req.body[imageKey]) {
        imageArray.push(req.body[imageKey]); // existing URL
      }
    }
    product.image = imageArray;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};






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
const adminSingleProduct = async (req, res) => {
    try {
      const { productId} = req.body;

      const product = await productModel.findById(productId);
  
        if(!product){
        res.json({ success: false, message: "Product  Not Found" });
        }
  
       return res.json({ success: true, product });

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



const submitReview = async (req, res) => {
  const { productId, review, rating,userId } = req.body;

  if (!productId || !review || !rating) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const product = await productModel.findById(productId);
    const user = await userModel.findById(userId) 

    if (!product || !user) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Add the new review
    const newReview = {
      userName:user.name,
      review,
      rating: Number(rating),
      date: new Date()
    };

    product.reviews.push(newReview);

    // Recalculate average rating
    const total = product.reviews.reduce((acc, cur) => acc + cur.rating, 0);
    product.averageRating = total / product.reviews.length;

    await product.save();

    res.status(200).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    console.error('Error submitting review:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



export { listProducts, addProduct, removeProduct, singleProduct,handleWishlist,submitReview,adminSingleProduct,updateProduct }