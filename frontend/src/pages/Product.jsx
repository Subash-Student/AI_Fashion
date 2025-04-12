import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import RelatedProducts from '../components/RelatedProducts'
import axios from 'axios'
import { Star } from 'lucide-react'



const dummyReviews = [
  {
    username: 'John Doe',
    rating: 4,
    review: 'Great product! Really loved the quality and delivery speed.',
  },
  {
    username: 'Jane Smith',
    rating: 5,
    review: 'Exceeded my expectations. Highly recommended!',
  },
  {
    username: 'Alex Johnson',
    rating: 3,
    review: 'Good product, but could be better in packaging.',
  },
  {
    username: 'Emily Davis',
    rating: 5,
    review: 'Very comfortable and fits perfectly.',
  },
  {
    username: 'Michael Brown',
    rating: 4,
    review: 'Decent price and fast shipping. Worth it.',
  },
]





const Product = () => {
  const { productId } = useParams()
  const { currency, addToCart,user } = useContext(ShopContext)
  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')


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
          <div className='flex gap-0.5'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i <productData.averageRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
              />
            ))}
          </div>
          <p className='pl-2'>({productData.reviews? productData.reviews.length : "122"}) Reviews</p>
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
  <button
    className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'bg-gray-200' : ''}`}
    onClick={() => setActiveTab('description')}
  >
    Description
  </button>
  <button
    className={`border px-5 py-3 text-sm ${activeTab === 'reviews' ? 'bg-gray-200' : ''}`}
    onClick={() => setActiveTab('reviews')}
  >
    Reviews (122)
  </button>
</div>

        {activeTab === 'description' ? (
  <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
    <p>
      An e-commerce website is an online platform that facilitates the buying and selling of products or services
      over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their
      products, interact with customers, and conduct transactions without the need for a physical presence.
    </p>
    <p>
      E-commerce websites typically display products or services along with detailed descriptions, images, prices,
      and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with
      relevant information.
    </p>
  </div>
) : (
<div className='border px-6 py-6 text-sm text-gray-700 max-h-[300px] overflow-y-auto space-y-4'>
  {productData.reviews.length > 0 ? (
    productData.reviews.map((review, index) => (
      <div key={index} className='border p-3 rounded bg-gray-50'>
        <div className='flex justify-between items-center mb-1'>
          <span className='font-semibold'>{review.userName}</span>
          <div className='flex gap-0.5'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
              />
            ))}
          </div>
        </div>
        <p className='text-gray-600'>{review.review}</p>
      </div>
    ))
  ) : (
    <div className='text-center text-gray-500 italic'>No reviews yet. Be the first to leave one!</div>
  )}
</div>

)}

      </div>

      {/* --------- display related products ---------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : (
    <div className='opacity-0'></div>
  )
}

export default Product
