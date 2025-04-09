import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import RecentlyViewed from '../components/RecentlyViewed'
import Mens from '../components/Mens'
import Women from '../components/Women'
import Kids from '../components/Kids'

const Home = () => {
  return (
    <div>
      <Hero />
      <RecentlyViewed />
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
