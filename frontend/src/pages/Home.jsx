import React, { useContext, useEffect } from 'react'
import Carousel from '../components/Carousel'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import RecentlyViewed from '../components/RecentlyViewed'
import Mens from '../components/Mens'
import Women from '../components/Women'
import Kids from '../components/Kids'
import { ShopContext } from '../context/ShopContext'
import { getHomePageSummary, textToSpeech } from '../utils/voiceContent'

const Home = () => {
  const {token,setPageValues,pageValues} = useContext(ShopContext);

  useEffect(() => {
    setPageValues({ currentPage: "common" });
    const speechText = getHomePageSummary();

    textToSpeech(speechText)
  }, []);
  
  
  

  return (
    <div>
      <div className='Caro'>
        <Carousel />
      </div>
      {token &&
        <RecentlyViewed />
      }
      <LatestCollection />
      <BestSeller />
      <Mens />
      <Women />
      <Kids />
      <OurPolicy />
    </div>
  )
}

export default Home
