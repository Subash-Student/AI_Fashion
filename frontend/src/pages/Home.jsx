import React, { useContext, useEffect } from 'react'
import Hero from '../components/Hero'
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
  const {token,setPageValues} = useContext(ShopContext);


  useEffect(()=>{
   
const speechText = getHomePageSummary();

textToSpeech(speechText);
setPageValues({ currentPage:"home",pageContent:speechText})

  },[])


  return (
    <div>
      <Hero />
      {token && 
      <RecentlyViewed />
      }
      <LatestCollection/>
      <BestSeller/>
      <Mens />
      <Women />
      <Kids />
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
