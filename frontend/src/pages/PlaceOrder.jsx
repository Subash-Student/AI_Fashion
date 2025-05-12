import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getPlaceOrderPageSummary, textToSpeech } from '../utils/voiceContent';

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod');
    const { navigate, user, showPincodeModal,showMic, setShowMic, setShowPincodeModal,setPageValues, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [pincode, setPincode] = useState(Array(6).fill(""));
    const [address, setAddress] = useState(user.address);

    useEffect(() => { if (showPincodeModal) handleVoiceInput(); }, [showPincodeModal]);

    const handleVoiceInput = () => {
        const utterance = new SpeechSynthesisUtterance("Say your pincode");
        utterance.rate = 0.8; utterance.pitch = 1; 
        utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === "en-US");
        speechSynthesis.speak(utterance);
        utterance.onend = startListening;
    };

    const startListening = () => {
        setShowMic(true)
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-US"; recognition.interimResults = false; recognition.maxAlternatives = 1;
        recognition.start();
        const stopTimer = setTimeout(() => { recognition.stop();setShowMic(false); console.log("Mic turned off after 5 seconds"); }, 5000);
        recognition.onresult = async (event) => {
            clearTimeout(stopTimer);
            setShowMic(false)
            const cleanedPincode = await cleanPincode(event.results[0][0].transcript);
            if (cleanedPincode.length === 6) {
                setPincode(cleanedPincode.split(''));
                await fetchAddressFromPincode(cleanedPincode);
            } else toast.error("Please say a valid 6-digit pincode");textToSpeech("Please say a valid 6-digit pincode")
        };
        recognition.onerror = (event) => { clearTimeout(stopTimer); recognition.stop(); toast.error("Error recognizing voice input"); console.log(event.error); };
    };

    const cleanPincode = async (transcript) => {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                prompt: `Extract a 6-digit pincode from this input: "${transcript}". Please return only the 6-digit number.`,
                max_tokens: 10,
                temperature: 0.0,
            }, { headers: { 'Authorization': `Bearer ${import.meta.env.VITE_GPT_KEY}` } });
            return response.data.choices[0].text.trim().replace(/\D/g, '');
        } catch (error) {
            console.error("Error cleaning pincode with GPT-4:", error);
            toast.error("Error cleaning pincode. Please try again.");
            textToSpeech("Error cleaning pincode. Please try again.")
            return '';
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
                    setAddress(`${postOffice.Name}, ${postOffice.District}, ${postOffice.State} - ${pin}`);
                    setShowPincodeModal(false);
                } else toast.error("Invalid pincode");textToSpeech("Invalid pincode")
            } catch (err) {
                toast.error("Enter a valid 6-digit pincode");
                textToSpeech("Enter a valid 6-digit pincode")
                console.error(err);
            }
        } else toast.warn("Enter a valid 6-digit pincode");textToSpeech("Enter a valid 6-digit pincode")
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            let orderItems = [];
            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items));
                        if (itemInfo) {
                            itemInfo.size = item; itemInfo.quantity = cartItems[items][item];
                            orderItems.push(itemInfo);
                        }
                    }
                }
            }
            const orderData = { address, items: orderItems, amount: getCartAmount() + delivery_fee };
            if (method === 'cod') {
                const response = await axios.post(`${backendUrl}/api/order/place`, orderData, { headers: { token } });
                if (response.data.success) {
                    setCartItems({}); navigate('/orders');
                    textToSpeech("your order successfully placed")
                } else toast.error(response.data.message); textToSpeech(response.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            textToSpeech(response.data.message)
        }
    };

    const handlePincodeChange = (index, value) => {
        const newPin = [...pincode];
        if (/^\d?$/.test(value)) {
            newPin[index] = value;
            setPincode(newPin);
        }
    };

    useEffect(() => {
        const triggerSubmit = () => onSubmitHandler(new Event('submit-from-voice'));
        window.addEventListener('voice_place_order', triggerSubmit);
        return () => window.removeEventListener('voice_place_order', triggerSubmit);
    }, []);

    useEffect(()=>{
   
        const speechText = getPlaceOrderPageSummary(getCartAmount,address,delivery_fee);
        
        textToSpeech(speechText);
    setPageValues({ currentPage:"placeOrder",pageContent:speechText})
        
          },[])


    return (
        <>
            <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
                <section id="address">
                    <h2 className="text-2xl font-bold mb-4">🏠 Address</h2>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p>{address || "No address set."}</p>
                        <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700" onClick={() => setShowPincodeModal(true)}>Change Address</button>
                    </div>
                </section>
                <div className='mt-8'>
                    <div className='mt-8 min-w-80'><CartTotal /></div>
                    <div className='mt-12'>
                        <Title text1={'PAYMENT'} text2={'METHOD'} />
                        <div className='flex gap-3 flex-col lg:flex-row'>
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
             {showMic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/70">
          <div className="relative flex flex-col items-center space-y-6">
            <div className="relative flex items-center justify-center w-40 h-40">
              <div className="absolute w-full h-full rounded-full bg-red-600 animate-pulse blur-sm"></div>
              <div className="absolute w-28 h-28 rounded-full bg-red-500 animate-ping"></div>
              <div className="relative z-10 w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-red-500 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18v3m0 0h3m-3 0H9m6-3a3 3 0 11-6 0V6a3 3 0 116 0v12z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-white text-xl font-semibold tracking-wide animate-pulse">Listening...</p>
          </div>
        </div>
      )}
        </>
    );
};

export default PlaceOrder;
