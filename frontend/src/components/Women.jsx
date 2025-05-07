import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const Kids = () => {

    const {products} = useContext(ShopContext);
    const [product,setProduct] = useState([]);

    useEffect(()=>{
        const womenProduct = products.filter((item)=>(item.category === "Women"));
        setProduct(womenProduct.slice(0,5))
    },[products])

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'Womens'} text2={'Collections'}/>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
        Express your unique style with our carefully selected pieces, designed to make you feel confident and beautiful.        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
            product.map((item,index)=>(
                <ProductItem key={index} id={item._id} name={item.name} image={item.image} price={item.price} />
            ))
        }
      </div>
    </div>
  )
}

export default Kids
