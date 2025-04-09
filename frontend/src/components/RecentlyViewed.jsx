import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RecentlyViewed = () => {

    const {user} = useContext(ShopContext);
    const [recentlyViewed,setRecentlyViewed] = useState([]);
   
    console.log(user)
    useEffect(()=>{
        setRecentlyViewed(user.recentlyViewed);
    },[user])

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'Revently'} text2={'Viewed'}/>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the.
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
          recentlyViewed  &&   recentlyViewed.map((item,index)=>(
                <ProductItem key={index} id={item._id} name={item.name} image={item.image} price={item.price} />
            ))
        }
      </div>
    </div>
  )
}

export default RecentlyViewed
