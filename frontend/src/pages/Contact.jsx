import React, { useContext, useEffect } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'
import { ShopContext } from '../context/ShopContext'
import { FaPhoneAlt } from 'react-icons/fa'  // <-- import the phone icon
import { getContactPageSummary, textToSpeech } from '../utils/voiceContent'


const Contact = () => {

  const { setPageValues } = useContext(ShopContext);


  useEffect(() => {
 
    const speechText = getContactPageSummary();

    textToSpeech(speechText)

    setPageValues({ currentPage: "contact", pageContent: speechText })

  }, [])

  return (
    <div>

      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className=' text-gray-500'>54709 Willms Station <br /> Suite 350, Washington, USA</p>
          <p className=' text-gray-500'>Tel: 9788306886 <br /> Email: admin@forever.com</p>
          <p className='font-semibold text-xl text-gray-600'>Contact Us</p>
          <p className='text-gray-500 flex items-center gap-2'>
          <button
  onClick={() => window.location.href = 'tel:9788306886'}
  className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition'
>
  <FaPhoneAlt className='text-white' />
  Call Now
</button>


          </p>

        </div>
      </div>

    </div>
  )
}

export default Contact
