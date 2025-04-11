import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShopContext } from "../context/ShopContext";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "address", label: "Address" },
  { id: "settings", label: "Settings" },
];

const Dashboard = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { user, token, orderData, getUserData, loadOrderData } = useContext(ShopContext);

  const [allUserData, setAllUserData] = useState({
    profile: user,
    orders: orderData
  });

  const [showModal, setShowModal] = useState(false);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [formData, setFormData] = useState({
    name: allUserData.profile.name,
    email: allUserData.profile.email,
    phone: allUserData.profile.phone,
  });
  const [pincode, setPincode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserData();
    loadOrderData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/api/user/edit", {
        ...formData,
      }, {
        headers: { token }
      });

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        allUserData.profile = { ...formData };
        setTimeout(() => setShowModal(false), 1000);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:4000/api/product/wishlist/remove}`;
      const res = await axios.post(url, { productId }, { headers: { token } });

      if (res.data.success) {
        setIsWishlisted(!isWishlisted);
      }
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

  const fetchAddressFromPincode = async () => {
    const pin = pincode.join("");
    if (pin.length === 6) {
      try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
        const data = res.data[0];
        if (data.Status === "Success") {
          const postOffice = data.PostOffice[0];
          const fullAddress = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State} - ${pin}`;

          const updateRes = await axios.post("http://localhost:4000/api/user/edit-address", {
            address: fullAddress
          }, {
            headers: { token }
          });

          if (updateRes.data.success) {
            toast.success("Address updated successfully!");
            setAllUserData((prev) => ({
              ...prev,
              profile: { ...prev.profile, address: fullAddress }
            }));
            setShowPincodeModal(false);
          } else {
            toast.error("Failed to update address");
          }
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
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 font-sans">
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
            <p><strong>Email:</strong> {allUserData.profile.email}</p>
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
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full mb-3 px-3 py-2 border rounded" />
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full mb-3 px-3 py-2 border rounded" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{loading ? "Saving..." : "Save"}</button>
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
    </div>
  );
};

export default Dashboard;
