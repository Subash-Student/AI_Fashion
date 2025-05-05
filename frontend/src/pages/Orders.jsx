import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTruck, FaBox, FaStar } from 'react-icons/fa';

const Orders = () => {
  const { backendUrl, orderData, token, currency } = useContext(ShopContext);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(4);
  const [reviewProductId, setReviewProductId] = useState(null);

  const statusSteps = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  const handleTrackOrder = (status) => {
    setSelectedStatus(status);
    setShowStatusModal(true);
  };

  const handleCancelOrder = (item) => {
    setSelectedItem(item);
    setShowCancelModal(true);
    setCancelReason('');
  };

   const handleOpenReview = (productId) => {
    setReviewProductId(productId);
    setReviewText('');
    setReviewRating(4);
    setShowReviewModal(true);
  };
console.log(reviewText)
  const submitReview = async (text = reviewText) => {
    try {

      console.log(reviewText)
      const res = await axios.post(
        backendUrl + '/api/product/review/add',
        { productId: reviewProductId, review: te, rating: reviewRating },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
      } else {
        toast.error('Failed to submit review');
      }
    } catch (err) {
      toast.error('Something went wrong while submitting the review');
    }
  };

  const getStatusStepIndex = (status) => {
    const lower = status.toLowerCase();
    const index = statusSteps.findIndex((s) => s.toLowerCase() === lower);
    return index !== -1 ? index : -1;
  };

  const submitCancelOrder = async (text = cancelReason) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/cancel', {
        orderId: selectedItem.orderId,
        productId: selectedItem.id,
        reason: text
      }, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success("Order cancelled successfully.");
        setShowCancelModal(false);
      } else {
        toast.error("Failed to cancel order.");
      }
    } catch (error) {
      toast.error("Server error while cancelling order.");
    }
  };

  const getStatusIcon = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return <FaCheckCircle className="text-green-600" />;
    if (s === 'canceled') return <FaTimesCircle className="text-red-600" />;
    if (s === 'shipped' || s === 'out for delivery') return <FaTruck className="text-blue-600" />;
    return <FaHourglassHalf className="text-yellow-500" />;
  };
console.log(orderData)

useEffect(() => {
  if (showStatusModal && selectedStatus) {
    const utterance = new SpeechSynthesisUtterance(`Your order status is: ${selectedStatus}`);
    window.speechSynthesis.speak(utterance);
  }
}, [showStatusModal, selectedStatus]);



useEffect(() => {
  // Start the voice prompt when the modal is shown
  if(showReviewModal){
    handleVoiceInput("review")
  }
 

}, [showReviewModal]);

useEffect(() => {
  // Start the voice prompt when the modal is shown
  if(showCancelModal){
    handleVoiceInput("cancel");

  }

}, [showCancelModal]);

const handleVoiceInput = (action) => {
  const utterance = new SpeechSynthesisUtterance(`${action==="review" ? "say your review":"say your reason to cancel"}`);
  utterance.rate = 0.8; // Slow speech
  utterance.pitch = 1; // Neutral pitch
  utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === "en-US"); // Choose a suitable voice
  speechSynthesis.speak(utterance);

  // After the speech, start listening for voice input
  utterance.onend = () => {
      startListening(action);
  };
};

const startListening = (action) => {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  // Automatically stop listening after 5 seconds
  const stopTimer = setTimeout(() => {
      recognition.stop();
      console.log("Mic turned off after 5 seconds");
  }, 5000);

  recognition.onresult = async (event) => {
      clearTimeout(stopTimer); // stop timer if result comes early
      const transcript = event.results[0][0].transcript;
      console.log("Transcript: ", transcript);
      if(action === "review"){
        setReviewText(transcript);
        submitReview(transcript)
      }else{
        setCancelReason(transcript);
        submitCancelOrder(transcript)
      }
  };

  recognition.onerror = (event) => {
      clearTimeout(stopTimer);
      recognition.stop(); // make sure it stops on error too
      toast.error("Error recognizing voice input");
      console.log(event.error);
  };
};




  return (
    <div className="border-t pt-16 b-50 min-h-screen">
      <div className="text-2xl mb-8">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className="grid gap-6 px-4 md:px-10 max-w-5xl mx-auto">
        {orderData.map((item, index) => {
          const isCancelled = item.status.toLowerCase() === 'canceled';
          const isDelivered = item.status.toLowerCase() === 'delivered';
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                isCancelled ? 'border-l-4 border-red-500 bg-red-50' : 'hover:shadow-lg'
              }`}
            >
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
                  <span
                    className={`capitalize ${
                      isCancelled ? 'text-red-600' : 'text-gray-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex gap-2 mt-1 flex-wrap justify-end">
                  <button
                    onClick={() => handleTrackOrder(item.status)}
                    className="bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 text-sm"
                  >
                    Track
                  </button>
                  {(!isCancelled && !isDelivered) && (
                    <button
                      onClick={() => handleCancelOrder(item)}
                      className="border border-red-500 text-red-500 px-4 py-1.5 rounded-full hover:bg-red-500 hover:text-white text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  {isDelivered && (
                    <button
                      onClick={() => handleOpenReview(item._id)}
                      className="border border-yellow-500 text-yellow-600 px-4 py-1.5 rounded-full hover:bg-yellow-500 hover:text-white text-sm"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Give Your Review</h2>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Share your thoughts about this product..."
            ></textarea>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <FaStar
                  key={num}
                  className={`text-2xl cursor-pointer ${num <= reviewRating ? 'text-yellow-500' : 'text-gray-300'}`}
                  onClick={() => setReviewRating(num)}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={submitReview}
                className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600"
                disabled={!reviewText.trim() || reviewRating === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Order Status</h2>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-black text-2xl">&times;</button>
            </div>

            {selectedStatus.toLowerCase() === 'canceled' ? (
              <div className="text-center text-red-600 font-semibold text-lg py-10">
                This order has been cancelled.
              </div>
            ) : (
              <div className="flex justify-between items-center">
                {statusSteps.map((step, index) => {
                  const currentStep = getStatusStepIndex(selectedStatus);
                  const isCompleted = index <= currentStep;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className={`w-5 h-5 rounded-full mb-1 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <p className={`text-xs text-center ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>{step}</p>
                      {index !== statusSteps.length - 1 && (
                        <div className={`w-full h-1 mt-2 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowStatusModal(false)}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Cancel Order</h2>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="What's the reason for cancellation?"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={submitCancelOrder}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
                disabled={!cancelReason.trim()}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
