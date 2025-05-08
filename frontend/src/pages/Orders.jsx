import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTruck, FaBox, FaStar } from 'react-icons/fa';
import { getOrdersPageSummary, textToSpeech } from '../utils/voiceContent';

const Orders = () => {
  const { backendUrl, orderData, token, currency, showStatusModal, setShowStatusModal, selectedStatus, 
    setSelectedStatus, showCancelModal, setShowCancelModal, cancelReason, setCancelReason, selectedItem, 
    setSelectedItem, showReviewModal, setShowReviewModal, reviewText, setReviewText, reviewRating, 
    setReviewRating, reviewProductId, setReviewProductId, handleTrackOrder, handleCancelOrder, 
    handleOpenReview, statusSteps,setPageValues,showMic, setShowMic } = useContext(ShopContext);

  const submitReview = async (text = reviewText) => {
    try {
      const res = await axios.post(backendUrl + '/api/product/review/add', 
        { productId: reviewProductId, review: text, rating: reviewRating }, { headers: { token } });
      res.data.success ? toast.success('Review submitted successfully!') : toast.error('Failed to submit review');
      setShowReviewModal(false);
    } catch (err) { toast.error('Something went wrong while submitting the review'); }
  };

  const getStatusStepIndex = (status) => statusSteps.findIndex(s => s.toLowerCase() === status.toLowerCase());

  const submitCancelOrder = async (text = cancelReason) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/cancel', {
        orderId: selectedItem.orderId, productId: selectedItem.id, reason: text
      }, { headers: { token } });
      response.data.success ? toast.success("Order cancelled successfully.") : toast.error("Failed to cancel order.");
      setShowCancelModal(false);
    } catch (error) { toast.error("Server error while cancelling order."); }
  };

  const getStatusIcon = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return <FaCheckCircle className="text-green-600" />;
    if (s === 'canceled') return <FaTimesCircle className="text-red-600" />;
    if (s === 'shipped' || s === 'out for delivery') return <FaTruck className="text-blue-600" />;
    return <FaHourglassHalf className="text-yellow-500" />;
  };

  useEffect(() => {
    if (showStatusModal && selectedStatus) {
      const utterance = new SpeechSynthesisUtterance(`Your order status is: ${selectedStatus}`);
      window.speechSynthesis.speak(utterance);
    }
  }, [showStatusModal, selectedStatus]);

  useEffect(() => { if(showReviewModal) handleVoiceInput("review") }, [showReviewModal]);
  useEffect(() => { if(showCancelModal) handleVoiceInput("cancel") }, [showCancelModal]);

  const handleVoiceInput = (action) => {
    const utterance = new SpeechSynthesisUtterance(`${action==="review" ? "say your review":"say your reason to cancel"}`);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === "en-US");
    speechSynthesis.speak(utterance);
    utterance.onend = () => startListening(action);
  };

  const startListening = (action) => {
    setShowMic(true)
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    const stopTimer = setTimeout(() => recognition.stop(), 5000);

    recognition.onresult = async (event) => {
      clearTimeout(stopTimer);
      const transcript = event.results[0][0].transcript;
      setShowMic(false)
      if(action === "review") { setReviewText(transcript); submitReview(transcript) }
      else { setCancelReason(transcript); submitCancelOrder(transcript) }
    };

    recognition.onerror = (event) => {
      clearTimeout(stopTimer);
      recognition.stop();
      setShowMic(false)

      toast.error("Error recognizing voice input");
    };
  };
  useEffect(()=>{
   
    const speechText = getOrdersPageSummary(orderData);
    
    textToSpeech(speechText);
    setPageValues({ currentPage:"orders",pageContent:speechText})
    
      },[])
  return (
    <div className="border-t pt-16 b-50 min-h-screen">
      <div className="text-2xl mb-8"><Title text1={'MY'} text2={'ORDERS'} /></div>
      <div className="grid gap-6 px-4 md:px-10 max-w-5xl mx-auto">
        {orderData.map((item, index) => {
          const isCancelled = item.status.toLowerCase() === 'canceled';
          const isDelivered = item.status.toLowerCase() === 'delivered';
          return (
            <div key={index} className={`bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${isCancelled ? 'border-l-4 border-red-500 bg-red-50' : 'hover:shadow-lg'}`}>
              <div className="flex items-center gap-4">
                <img src={item.image[0]} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Qty: {item.quantity} | Size: {item.size}</p>
                    <p>Price: {currency}{item.price}</p>
                    <p>Payment: {item.paymentMethod}</p>
                    <p className="text-gray-400">Date: {new Date(item.date).toDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {getStatusIcon(item.status)}
                  <span className={`capitalize ${isCancelled ? 'text-red-600' : 'text-gray-700'}`}>{item.status}</span>
                </div>
                <div className="flex gap-2 mt-1 flex-wrap justify-end">
                  <button onClick={() => handleTrackOrder(item.status)} className="bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 text-sm">Track</button>
                  {(!isCancelled && !isDelivered) && (
                    <button onClick={() => handleCancelOrder(item)} className="border border-red-500 text-red-500 px-4 py-1.5 rounded-full hover:bg-red-500 hover:text-white text-sm">Cancel</button>
                  )}
                  {isDelivered && (
                    <button onClick={() => handleOpenReview(item._id)} className="border border-yellow-500 text-yellow-600 px-4 py-1.5 rounded-full hover:bg-yellow-500 hover:text-white text-sm">Review</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Give Your Review</h2>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Share your thoughts about this product..."></textarea>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <FaStar key={num} className={`text-2xl cursor-pointer ${num <= reviewRating ? 'text-yellow-500' : 'text-gray-300'}`} onClick={() => setReviewRating(num)}/>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReviewModal(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100">Close</button>
              <button onClick={submitReview} className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600" disabled={!reviewText.trim() || reviewRating === 0}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Order Status</h2>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-black text-2xl">&times;</button>
            </div>
            {selectedStatus.toLowerCase() === 'canceled' ? (
              <div className="text-center text-red-600 font-semibold text-lg py-10">This order has been cancelled.</div>
            ) : (
              <div className="flex justify-between items-center">
                {statusSteps.map((step, index) => {
                  const currentStep = getStatusStepIndex(selectedStatus);
                  const isCompleted = index <= currentStep;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className={`w-5 h-5 rounded-full mb-1 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <p className={`text-xs text-center ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>{step}</p>
                      {index !== statusSteps.length - 1 && <div className={`w-full h-1 mt-2 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`}></div>}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 text-center">
              <button onClick={() => setShowStatusModal(false)} className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Cancel Order</h2>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="What's the reason for cancellation?"></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCancelModal(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100">Close</button>
              <button onClick={submitCancelOrder} className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700" disabled={!cancelReason.trim()}>Confirm Cancel</button>
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

export default Orders;