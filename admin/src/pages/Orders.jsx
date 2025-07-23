import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { useLoader } from '../context/LoaderContext.jsx';


const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [showReason, setShowReason] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const { setIsLoading } = useLoader();
  
  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: { token }
      })
      setIsLoading(false);
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      setIsLoading(true)
      const response = await axios.post(`${backendUrl}/api/order/status`, {
        orderId,
        status: event.target.value
      }, {
        headers: { token }
      })
      setIsLoading(false)
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleShowReason = (reason) => {
    setSelectedReason(reason || "No reason provided.")
    setShowReason(true)
  }

  const closePopup = () => {
    setShowReason(false)
    setSelectedReason("")
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div className="relative">
      <h3 className="text-lg font-semibold py-4">Order Page</h3>
      <div>
        {
          orders.map((order, index) => (
            <div key={index} className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 rounded-xl shadow-sm'>
              <img className='w-12' src={assets.parcel_icon} alt="parcel" />
              <div>
                <div>
                  {order.items.map((item, idx) => (
                    <p className='py-0.5' key={idx}>
                      {item.name} x {item.quantity} <span>{item.size}</span>{idx < order.items.length - 1 ? ',' : ''}
                    </p>
                  ))}
                </div>
                <p className='mt-3 mb-2 font-medium'>
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.paymentMethod}</p>
                <p>Payment : {order.payment ? 'Done' : 'Pending'}</p>
                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px] font-semibold'>{currency}{order.amount}</p>

              {order.status === "Canceled" ? (
                <button
                  onClick={() => handleShowReason(order.reason)}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-red-200"
                >
                  Cancelled
                </button>
              ) : (
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                  className='p-2 font-semibold border border-gray-300 rounded-md'
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              )}
            </div>
          ))
        }
      </div>

      {/* Reason Popup */}
      {showReason && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-[90%] p-6 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Order Cancelled</h2>
            <p className="text-gray-700">Reason: <span className="font-medium">{selectedReason}</span></p>
            <button
              onClick={closePopup}
              className="mt-4 px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
