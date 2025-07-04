import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShopContext } from "../context/ShopContext";
import { getDashboardPageSummary, textToSpeech } from "../utils/voiceContent";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "address", label: "Address" },
  { id: "settings", label: "Settings" },
];

const Dashboard = () => {

 
  const { user, token,setPageValues,showPincodeModal, setShowPincodeModal,showMic, setShowMic, orderData, getUserData, setIsWishlisted, isWishlisted, loadOrderData, showModal, setShowModal } = useContext(ShopContext);
  const [allUserData, setAllUserData] = useState({ profile: user, orders: orderData });
  
  const [formData, setFormData] = useState({ name: allUserData.profile.name, phone: allUserData.profile.phone });
  const [pincode, setPincode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserData(token);
    loadOrderData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (data) => {
    
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/api/user/edit", { ...data }, { headers: { token } });
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        getUserData(token)
        textToSpeech("Profile updated successfully!");
        setAllUserData((prev) => ({ ...prev, profile: { ...data } }));
        // setTimeout(() => setShowModal(false), 2000);
      } else {
        toast.error(res.data.message || "Update failed");
        textToSpeech(res.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Server error. Please try again.");
      textToSpeech("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const res = await axios.post("http://localhost:4000/api/product/wishlist/remove", { productId }, { headers: { token: localStorage.getItem('token') } });
      if (res.data.success) setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
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
    if (showPincodeModal) handleVoiceInput();
  }, [showPincodeModal]);

  const handleVoiceInput = () => {
    const utterance = new SpeechSynthesisUtterance("Say your pincode");
    utterance.rate = 0.8; 
    utterance.pitch = 1; 
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === "en-US");
    speechSynthesis.speak(utterance);
    utterance.onend = startListening;
  };

  const startListening = () => {
    setShowMic(true)
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    const stopTimer = setTimeout(() => {
      recognition.stop();
      console.log("Mic turned off after 5 seconds");
    }, 5000);

    recognition.onresult = async (event) => {
      clearTimeout(stopTimer);
      const transcript = event.results[0][0].transcript;
      setShowMic(false)

      const cleanedPincode = await cleanPincode(transcript);
      if (cleanedPincode.length === 6) {
        setPincode(cleanedPincode.split(''));
        await fetchAddressFromPincode(cleanedPincode);
      } else {
        toast.error("Please say a valid 6-digit pincode");
        textToSpeech("Please say a valid 6-digit pincode");
      }
    };

    recognition.onerror = (event) => {
      clearTimeout(stopTimer);
      recognition.stop();
      toast.error("Error recognizing voice input");
      textToSpeech("Error recognizing voice input");
      console.log(event.error);
    };
  };

  const cleanPincode = async (transcript) => {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Extract a 6-digit pincode from this input: "${transcript}". Please return only the 6-digit number.`
          }
        ],
        max_tokens: 10,
        temperature: 0.0,
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GPT_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data.choices[0].message.content.trim().replace(/\D/g, '');
  
    } catch (error) {
      console.error("Error cleaning pincode with GPT:", error.response?.data || error.message);
      toast.error("Error cleaning pincode. Please try again.");
      textToSpeech("Error cleaning pincode. Please try again.");
      return '';
    }
  };
  

  const fetchAddressFromPincode = async (pincode) => {
    
    let searchPIN;

    if(pincode.length === 6){
      searchPIN = pincode
    }else{
      searchPIN = pincode.join("");
    }
     

    
    if (searchPIN.length !== 6 || !/^\d{6}$/.test(searchPIN)) {
      toast.warn("Enter a valid 6-digit pincode");
      textToSpeech("Enter a valid 6-digit pincode");
      return;
    }
  
    try {
      const res = await axios.get(`https://api.postalpincode.in/pincode/${searchPIN}`);
      const data = res.data[0];
  
      if (data.Status === "Success" && data.PostOffice?.length > 0) {
        const postOffice = data.PostOffice[0];
        const fullAddress = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State} - ${searchPIN}`;
  
        const updateRes = await axios.post(
          "http://localhost:4000/api/user/edit-address",
          { address: fullAddress },
          { headers: { token } }
        );
  
        if (updateRes.data.success) {
          toast.success("Address updated successfully!");
          textToSpeech("Address updated successfully!");
          setAllUserData((prev) => ({
            ...prev,
            profile: { ...prev.profile, address: fullAddress }
          }));
          setShowPincodeModal(false);
        } else {
          toast.error("Failed to update address");
          textToSpeech("Failed to update address");
        }
  
      } else {
        toast.error("Invalid pincode or no address found");
        textToSpeech("Invalid pincode or no address found");
      }
  
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Error fetching address");
      textToSpeech("Error fetching address");
    }
  };
  

  useEffect(() => {
    if (showModal) handleVoiceInputForNameAndPhone();
  }, [showModal]);

  const handleVoiceInputForNameAndPhone = () => {
    const utterance = new SpeechSynthesisUtterance("Say your name and phone number");
    utterance.rate = 0.8; 
    utterance.pitch = 1; 
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === "en-US");
    speechSynthesis.speak(utterance);
    utterance.onend = startListeningForNameAndPhone;
  };

  const startListeningForNameAndPhone = () => {
    setShowMic(true)

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    const stopTimer = setTimeout(() => {
      recognition.stop();
      console.log("Mic turned off after 7 seconds");
    }, 7000);

    recognition.onresult = async (event) => {
      clearTimeout(stopTimer);
      const transcript = event.results[0][0].transcript;
      setShowMic(false)

      const cleanedData = await extractNameAndPhone(transcript);
      if (cleanedData) {
        setFormData(cleanedData);
        await handleSave(cleanedData);
      } else {
        toast.error("Please say a name and phone number");
        textToSpeech("Please say a name and phone number");
      }
    };

    recognition.onerror = (event) => {
      clearTimeout(stopTimer);
      recognition.stop();
      setShowMic(false)

      toast.error("Error recognizing voice input");
      textToSpeech("Error recognizing voice input");
      console.log(event.error);
    };
  };

  const extractNameAndPhone = async (transcript) => {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Extract the full name and 10-digit phone number from this sentence: "${transcript}". Return the result strictly in JSON format like this: {"name": "Full Name", "phone": "1234567890"}.
            and validate the name(only alphaphat) and phone number(only 10 digits) and if one of two fields failedd in validation then replace with this data ${allUserData.profile.name,allUserData.profile.phone}`
          }
        ],
        max_tokens: 60,
        temperature: 0.0,
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GPT_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      const rawText = response.data.choices[0].message.content.trim();
      const result = JSON.parse(rawText);
      return {
        name: result.name || '',
        phone: result.phone || ''
      };
  
    } catch (error) {
      console.error("Error extracting name and phone with GPT:", error.response?.data || error.message);
      toast.error("Failed to extract name and phone.");
      textToSpeech("Failed to extract name and phone.");
      return { name: '', phone: '' };
    }
  };
  
  useEffect(()=>{
   
    const speechText = getDashboardPageSummary(allUserData);
    
    textToSpeech(speechText);
    setPageValues({ currentPage:"dashboard",pageContent:speechText})
    
      },[])
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 font    -sans">
    <ToastContainer position="top-center" />
    <nav className="sticky top-0 z-20 bg-white shadow-md px-4 py-3 flex overflow-x-auto gap-4 sm:justify-center">
      {sections.map((sec) => (
        <button
          key={sec.id}
          onClick={() => scrollToSection(sec.id)}
          className="text-sm font-semibold text-blue-600 whitespace-nowrap px-4 py-2 rounded-full border border-blue-100 hover:bg-blue-100 transition"
          aria-label={`Go to ${sec.label}`}
        >
          {sec.label}
        </button>
      ))}
    </nav>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-20">
      <section id="profile">
        <h2 className="text-2xl font-bold mb-4">👤 Profile</h2>
        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-3">
          <p><strong>Name:</strong> {allUserData.profile.name}</p>
          <p><strong>Phone:</strong> {allUserData.profile.phone}</p>
          <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700" onClick={() => setShowModal(true)}>Edit Profile</button>
        </div>
      </section>

      <section id="orders">
        <h2 className="text-2xl font-bold mb-4">📦 Orders</h2>
        <div className="grid gap-4">
          {allUserData.orders.map((order, index) => (
            <div key={index} className="bg-white rounded-2xl shadow p-5 flex justify-between">
              <div>
                <p>{order.name}</p>
                <p className="text-gray-600">₹{order.price}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Canceled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="wishlist">
        <h2 className="text-2xl font-bold mb-4">❤️ Wishlist</h2>
        <div className="grid gap-4">
          {(allUserData.profile.wishlist || []).map((item, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl shadow flex justify-between items-center">
              <p>{item.name} - ₹{item.price}</p>
              <button onClick={() => toggleWishlist(item._id)} className="text-red-500 font-medium hover:underline">Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section id="address">
        <h2 className="text-2xl font-bold mb-4">🏠 Address</h2>
        <div className="bg-white p-6 rounded-2xl shadow">
          <p>{allUserData.profile.address || "No address set."}</p>
          <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700" onClick={() => setShowPincodeModal(true)}>Change Address</button>
        </div>
      </section>

      <section id="settings">
        <h2 className="text-2xl font-bold mb-4">⚙️ Settings</h2>
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900">Change Password</button>
          <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">Logout</button>
        </div>
      </section>
    </div>

    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full mb-3 px-3 py-2 border rounded" />
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full mb-3 px-3 py-2 border rounded" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
              <button onClick={()=>handleSave(formData)} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{loading ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default Dashboard;
