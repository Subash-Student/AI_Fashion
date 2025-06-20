import React, { useContext, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './pages/DashBoard'
import ProtectRoute from './utils/ProtectRoute'
import { ShopContext } from './context/ShopContext'
import Loader from './components/Loader'
import VoiceAssistant from './components/VoiceAssistant'
import { stopSpeech } from './utils/voiceContent'

const App = () => {

  const {isLoading} = useContext(ShopContext)
  useEffect(() => {
    const handleDoubleClick = () => {
      stopSpeech(); 
      console.log("🛑 Speech stopped due to double-click"); 
    };
  
    document.addEventListener("dblclick", handleDoubleClick);
  
    // Cleanup
    return () => {
      document.removeEventListener("dblclick", handleDoubleClick);
    };
  }, []);
  
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <VoiceAssistant />
      {isLoading && <Loader />}
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />}/>
        <Route path='/login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
       
      </Routes>
      <Footer />
    </div>
  )
}

export default App
