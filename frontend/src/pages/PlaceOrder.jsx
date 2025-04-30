import React, { useContext, useState,useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate,user,showPincodeModal, setShowPincodeModal, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [pincode, setPincode] = useState(Array(6).fill(""));
   const [address,setAddress] = useState(user.address)

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name:'Order Payment',
            description:'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log(response)
                try {
                    
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay',response,{headers:{token}})
                    if (data.success) {
                        navigate('/orders')
                        setCartItems({})
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error)
                }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    useEffect(() => {
        const triggerSubmit = () => {
          onSubmitHandler(new Event('submit-from-voice'));
        };
    
        // Listen for global event
        window.addEventListener('voice_place_order', triggerSubmit);
    
        return () => {
          window.removeEventListener('voice_place_order', triggerSubmit);
        };
      }, []);


    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {

            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if (itemInfo) {
                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            let orderData = {
                address: address,
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            }
            

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                    if (response.data.success) {
                        setCartItems({})
                        navigate('/orders')
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe',orderData,{headers:{token}})
                    if (responseStripe.data.success) {
                        const {session_url} = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                case 'razorpay':

                    const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers:{token}})
                    if (responseRazorpay.data.success) {
                        initPay(responseRazorpay.data.order)
                    }

                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    const handlePincodeChange = (index, value) => {
        const newPin = [...pincode];
        if (/^\d?$/.test(value)) {
          newPin[index] = value;
          setPincode(newPin);
        }
      };




    const fetchAddressFromPincode = async () => {
        const pin = pincode.join("");
        if (pin.length === 6) {
          try {
            const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
            const data = res.data[0];
            if (data.Status === "Success") {
              const postOffice = data.PostOffice[0];
              const fullAddress = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State} - ${pin}`;
                
              setAddress(fullAddress);
              setShowPincodeModal(false)
            } else {
              toast.error("Invalid pincode");
            }
          } catch (err) {
            toast.error("Error fetching address");
            console.error(err);
          }
        } else {
          toast.warn("Enter a valid 6-digit pincode");
        }
      };

    return (
        <>
        <div  className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <section id="address">
          <h2 className="text-2xl font-bold mb-4">🏠 Address</h2>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p>{address || "No address set."}</p>
            <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700" onClick={() => setShowPincodeModal(true)}>Change Address</button>
           
          </div>
        </section>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button onClick={onSubmitHandler} type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
            
        </div>
        {showPincodeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-center">Enter Your 6-Digit Pincode</h3>
                <div className="flex justify-between gap-2 mb-4">
                  {pincode.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePincodeChange(index, e.target.value)}
                      className="w-10 h-12 text-center text-lg border rounded"
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowPincodeModal(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
                  <button onClick={fetchAddressFromPincode} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                </div>
              </div>
            </div>
          )}
        </>

    )
}

export default PlaceOrder
