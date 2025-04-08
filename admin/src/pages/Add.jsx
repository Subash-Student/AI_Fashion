import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Add = ({ token }) => {
  const [images, setImages] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false
  });

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "Men",
    subCategory: "Topwear",
    bestseller: false,
    sizes: [],
    brand: "",
    material: "",
    fitType: "",
    pattern: "",
    colorOptions: "",
    occasion: "",
    washCare: "",
    inStock: true,
    secondryColor: "",
    returnable: false,
    sleeveType:"",
    neckType:""
  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Append all product fields
      Object.keys(product).forEach(key => {
        if (key === 'sizes') {
          formData.append(key, JSON.stringify(product[key]));
        } else {
          formData.append(key, product[key]);
        }
      });

      // Append images
      Object.keys(images).forEach(key => {
        if (images[key]) {
          formData.append(key, images[key]);
        }
      });

      const response = await axios.post(backendUrl + "/api/product/add", formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setProduct({
          ...product,
          name: "",
          description: "",
          price: "",
          sizes: [],
          brand: "",
          material: "",
          fitType: "",
          pattern: "",
          colorOptions: "",
          occasion: "",
          washCare: "",
          secondryColor: "",
          sleeveType:"",
          neckType:""
        });
        setImages({
          image1: false,
          image2: false,
          image3: false,
          image4: false
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    setImages({
      ...images,
      [`image${index + 1}`]: file
    });
  };

  const toggleSize = (size) => {
    setProduct({
      ...product,
      sizes: product.sizes.includes(size) 
        ? product.sizes.filter(s => s !== size) 
        : [...product.sizes, size]
    });
  };

  



  const handleAutoFill = async (e)=>{
    e.preventDefault();
    
    const formData = new FormData();

    formData.append("images",images);

    try {
      
      const response = await axios.get(backendUrl +"/api/extract-dress-info",formData,{
        headers:{token}
      });

      if (response.data.success) {
        const data = response.data.data;
        toast.success(response.data.message);
        
        setProduct({
          ...product,
          name: data.name,
          description: data.description,
          price: "",
          sizes: [],
          brand: data.brand,
          material: data.material,
          fitType: data.fitType,
          pattern: data.pattern,
          colorOptions: data.color,
          occasion: data.occasion,
          washCare: data.washCare,
          secondryColor:data.secondryColor,
          sleeveType:data.sleeveType,
          neckType:data.neckType
        });
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }

  }


  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-5">
      {/* Image Upload */}
      <div className="mt-2">
        <button
        onClick={handleAutoFill}
          className="bg-blue-600 text-white mb-2 px-4 py-1 rounded-full hover:bg-blue-700 transition-all text-sm shadow-md"
        > 
          Auto Fill
        </button>

        <label className="mb-2 block">Upload Images</label>
        <div className="flex gap-2 flex-wrap">
          {[images.image1, images.image2, images.image3, images.image4].map((img, idx) => (
            <label key={idx} htmlFor={`image${idx + 1}`}>
              <img className="w-20 h-20 object-cover border" src={!img ? assets.upload_area : URL.createObjectURL(img)} alt="" />
              <input 
                type="file" 
                hidden 
                id={`image${idx + 1}`} 
                onChange={(e) => handleImageChange(e, idx)} 
              />
            </label>
          ))}
        </div>
      </div>

      {/* Product Name */}
      <div className="w-full">
        <label className="mb-1 block">Product Name *</label>
        <input 
          type="text" 
          required 
          className="w-full max-w-[500px] px-3 py-2" 
          placeholder="Enter product name"
          name="name"
          value={product.name} 
          onChange={handleInputChange} 
        />
      </div>

      {/* Description */}
      <div className="w-full">
        <label className="mb-1 block">Description *</label>
        <textarea 
          required 
          className="w-full max-w-[500px] px-3 py-2" 
          placeholder="Enter product description"
          name="description"
          value={product.description} 
          onChange={handleInputChange} 
        />
      </div>

      {/* Price + Category */}
      <div className="grid sm:grid-cols-3 gap-4 w-full max-w-[500px]">
        <div>
          <label className="mb-1 block">Price *</label>
          <input 
            type="number" 
            className="w-full px-3 py-2" 
            placeholder="Enter price"
            name="price"
            value={product.price} 
            onChange={handleInputChange} 
          />
        </div>

        <div>
          <label className="mb-1 block">Category *</label>
          <select 
            className="w-full px-3 py-2" 
            name="category"
            value={product.category} 
            onChange={handleInputChange}
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block">Sub-category *</label>
          <select 
            className="w-full px-3 py-2" 
            name="subCategory"
            value={product.subCategory} 
            onChange={handleInputChange}
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>
      </div>

      {/* Brand, Material, Fit, Pattern */}
      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-[500px]">
        <div>
          <label className="mb-1 block">Brand *</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. Nike"
            name="brand"
            value={product.brand} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label className="mb-1 block">Material *</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. Cotton"
            name="material"
            value={product.material} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label className="mb-1 block">Fit Type</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. Slim Fit"
            name="fitType"
            value={product.fitType} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label className="mb-1 block">Pattern</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. Solid"
            name="pattern"
            value={product.pattern} 
            onChange={handleInputChange} 
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className="mb-1 block">Sizes Available</label>
        <div className="flex gap-2 flex-wrap">
          {["S", "M", "L", "XL", "XXL"].map(size => (
            <p 
              key={size}
              className={`cursor-pointer px-3 py-1 border ${product.sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"}`}
              onClick={() => toggleSize(size)}
            >
              {size}
            </p>
          ))}
        </div>
      </div>

      {/* Color, Occasion, Wash Care, Discount */}
      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-[500px]">
        <div>
          <label className="mb-1 block">Color Options (comma separated)</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. Red, Blue, Green"
            name="colorOptions"
            value={product.colorOptions} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label className="mb-1 block">Occasion</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. Casual"
            name="occasion"
            value={product.occasion} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label className="mb-1 block">Wash Care Instructions</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. Machine wash"
            name="washCare"
            value={product.washCare} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label className="mb-1 block">Secondry Color</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. white"
            name="secondryColor"
            value={product.secondryColor} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label className="mb-1 block">Sleeve Type</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. white"
            name="sleeveType"
            value={product.sleeveType} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <label className="mb-1 block">Neck Type</label>
          <input 
            type="text" 
            className="w-full px-3 py-2" 
            placeholder="e.g. white"
            name="neckType"
            value={product.neckType} 
            onChange={handleInputChange} 
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6 flex-wrap">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="inStock"
            checked={product.inStock} 
            onChange={handleInputChange} 
          />
          In Stock
        </label>
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="returnable"
            checked={product.returnable} 
            onChange={handleInputChange} 
          />
          Returnable
        </label>
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="bestseller"
            checked={product.bestseller} 
            onChange={handleInputChange} 
          />
          Bestseller
        </label>
      </div>

      <button type="submit" className="w-32 py-3 mt-4 bg-black text-white rounded-md">ADD</button>
    </form>
  );
};

export default Add;