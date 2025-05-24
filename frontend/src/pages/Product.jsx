import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import RelatedProducts from '../components/RelatedProducts'
import axios from 'axios'
import { Star } from 'lucide-react'
import { getProductPageSummary, textToSpeech } from '../utils/voiceContent'

const Product = () => {
  const { productId } = useParams()
  const { currency,setIsLoading, addToCart,user,pageValues,setPageValues,size,setSize,isWishlisted,setIsWishlisted,toggleWishlist } = useContext(ShopContext)
  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        const res = await axios.post('http://localhost:4000/api/product/single',{ productId },{ headers: { token } })
        setIsLoading(false)

        if (res.data.success) {
          setProductData(res.data.product)
          setImage(res.data.product.image[0])
          setIsWishlisted(res.data.product.isWishlisted || false)
        }
      } catch (error) { console.error(error) }
    }
    fetchProduct()
  }, [productId])

  useEffect(() => {
    if (user && user.wishlist && productData) {
      const isWishListed = user.wishlist.find(product => product._id.toString() === productData._id.toString())
      setIsWishlisted(!!isWishListed)
    }
  }, [user, productData])

  useEffect(() => {
    if (productData) {
      const speechText = getProductPageSummary(productData);
      setPageValues({
        currentPage: "ProductDetails",
        values: { productData },
        pageContent: speechText
      });
      textToSpeech(speechText)
    }
  }, [productData]);
  useEffect(() => {
    console.log("Updated pageValues in Product page:", pageValues);
  }, [pageValues]);
  



  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 relative'>
      <div className='absolute top-4 right-4 text-red-600 text-2xl cursor-pointer z-10' onClick={()=>toggleWishlist(productId)}>
        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
      </div>
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
              <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt='' />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt='' />
          </div>
        </div>
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex gap-0.5'>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i <productData.averageRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
            ))}
          </div>
          <p className='pl-2'>({productData.reviews? productData.reviews.length : "122"}) Reviews</p>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          {/* <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p> */}
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button onClick={() => setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => addToCart(productData._id, size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>
            ADD TO CART
          </button>
          <div className='mt-8 sm:w-4/5'>
            <h2 className='text-lg font-semibold mb-3'>Product Details</h2>
            <div className='max-h-64 overflow-y-auto border rounded'>
              <table className='w-full text-sm text-left'>
                <tbody className='divide-y'>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Brand</td><td className='py-2 px-4 text-gray-600'>{productData.brand}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Fit Type</td><td className='py-2 px-4 text-gray-600'>{productData.fitType}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Material</td><td className='py-2 px-4 text-gray-600'>{productData.material}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Color</td><td className='py-2 px-4 text-gray-600'>{productData.colorOptions}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Secondary Color</td><td className='py-2 px-4 text-gray-600'>{productData.secondryColor}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Sleeve Type</td><td className='py-2 px-4 text-gray-600'>{productData.sleeveType}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Neck Type</td><td className='py-2 px-4 text-gray-600'>{productData.neckType}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Occasion</td><td className='py-2 px-4 text-gray-600'>{productData.occasion}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Pattern</td><td className='py-2 px-4 text-gray-600'>{productData.pattern}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Wash Type</td><td className='py-2 px-4 text-gray-600'>{productData.washCare}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>In Stock</td><td className='py-2 px-4 text-gray-600'>{productData.inStock ? 'Yes' : 'No'}</td></tr>
                  <tr><td className='py-2 px-4 font-medium text-gray-700'>Returnable</td><td className='py-2 px-4 text-gray-600'>{productData.returnable ? 'Yes' : 'No'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p><p>Cash on delivery is available on this product.</p><p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>
      <div className='mt-20'>
        <div className='flex'>
          <button className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'bg-gray-200' : ''}`} onClick={() => setActiveTab('description')}>
            Description
          </button>
          <button className={`border px-5 py-3 text-sm ${activeTab === 'reviews' ? 'bg-gray-200' : ''}`} onClick={() => setActiveTab('reviews')}>
            Reviews ({productData.reviews.length})
          </button>
        </div>
        {activeTab === 'description' ? (
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
            <p>{productData.description}</p>
            {/* <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p> */}
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
                        <Star key={i} size={14} className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
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
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : (
    <div className='opacity-0'></div>
  )
}

export default Product