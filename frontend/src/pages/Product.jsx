import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import RelatedProducts from '../components/RelatedProducts'
import axios from 'axios'

const Product = () => {
  const { productId } = useParams()
  const { currency, addToCart,user } = useContext(ShopContext)
  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(
          'http://localhost:4000/api/product/single',
          { productId },
          { headers: { token } }
        )

        if (res.data.success) {
          setProductData(res.data.product)
          setImage(res.data.product.image[0])
          setIsWishlisted(res.data.product.isWishlisted || false)
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchProduct()
    


}, [productId])

useEffect(() => {
  if (user && user.wishlist && productData) {
    const isWishListed = user.wishlist.find(
      product => product._id.toString() === productData._id.toString()
    );
    setIsWishlisted(!!isWishListed);
  }
}, [user, productData]);



  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = `http://localhost:4000/api/product/wishlist/${isWishlisted ? 'remove' : 'add'}`
      const res = await axios.post(url, { productId }, { headers: { token } })

      if (res.data.success) {
        setIsWishlisted(!isWishlisted)
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error)
    }
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 relative'>

      {/* Wishlist Icon at top right */}
      <div className='absolute top-4 right-4 text-red-600 text-2xl cursor-pointer z-10' onClick={toggleWishlist}>
        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
      </div>

      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                alt=''
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt='' />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          {/* <div className='flex items-center gap-1 mt-2'>
            {[...Array(4)].map((_, i) => (
              <img src='/star_icon.png' alt='star' className='w-3.5' key={i} />
            ))}
            <img src='/star_dull_icon.png' alt='star' className='w-3.5' />
            <p className='pl-2'>(122)</p>
          </div> */}
          <p className='pl-2'>(122) Reviews</p>
          <p className='mt-5 text-3xl font-medium'>
            {currency}
            {productData.price}
          </p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => addToCart(productData._id, size)}
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
          >
            ADD TO CART
          </button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>
            An e-commerce website is an online platform that facilitates the buying and selling of products or services
            over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their
            products, interact with customers, and conduct transactions without the need for a physical presence.
            E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global
            reach they offer.
          </p>
          <p>
            E-commerce websites typically display products or services along with detailed descriptions, images, prices,
            and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with
            relevant information.
          </p>
        </div>
      </div>

      {/* --------- display related products ---------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : (
    <div className='opacity-0'></div>
  )
}

export default Product
