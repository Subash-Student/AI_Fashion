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

const Home = () => {
  const {token} = useContext(ShopContext);

  const slides =  [
    {
        "scr": "https://picsum.photos/seed/picsum/600/400",
        "alt": "image 1"
    },
    {
        "scr": "https://picsum.photos/id/77/600/400",
        "alt": "image 2"
    },
    {
        "scr": "https://picsum.photos/id/8/600/400",
        "alt": "image_3"
    }
]

  return (
    <div>
      <div className='Caro'>
        <Carousel data={slides} />
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
      {/* <NewsletterBox /> */}
    </div>
  )
}

export default Home
