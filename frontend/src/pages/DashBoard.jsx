import React from "react";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "address", label: "Address" },
  { id: "settings", label: "Settings" },
];

const dummyData = {
  profile: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210"
  },
  orders: [
    { id: "123456", item: "Red Kurti", price: 899, status: "Delivered" },
    { id: "123457", item: "Blue Saree", price: 1299, status: "Processing" }
  ],
  wishlist: [
    { id: 1, item: "Maroon Dress", price: 799 },
    { id: 2, item: "Pink Kurta", price: 999 }
  ],
  address: "123 Fashion Street, Chennai, TN",
};

const Dashboard = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 font-sans">
      {/* Sticky Navigation */}
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
        {/* Profile */}
        <section id="profile" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="text-2xl font-bold mb-4">👤 Profile</h2>
          <div className="bg-white shadow-lg rounded-2xl p-6 space-y-3">
            <p><strong>Name:</strong> {dummyData.profile.name}</p>
            <p><strong>Email:</strong> {dummyData.profile.email}</p>
            <p><strong>Phone:</strong> {dummyData.profile.phone}</p>
            <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">Edit Profile</button>
          </div>
        </section>

        {/* Orders */}
        <section id="orders" aria-labelledby="orders-heading">
          <h2 id="orders-heading" className="text-2xl font-bold mb-4">📦 Orders</h2>
          <div className="grid gap-4">
            {dummyData.orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p><strong>Order #{order.id}</strong> - {order.item}</p>
                  <p className="text-gray-600">₹{order.price}</p>
                </div>
                <span className={`mt-2 sm:mt-0 text-sm px-3 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Wishlist */}
        <section id="wishlist" aria-labelledby="wishlist-heading">
          <h2 id="wishlist-heading" className="text-2xl font-bold mb-4">❤️ Wishlist</h2>
          <div className="grid gap-4">
            {dummyData.wishlist.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow flex justify-between items-center">
                <p>{item.item} - ₹{item.price}</p>
                <button className="text-red-500 font-medium hover:underline" aria-label={`Remove ${item.item} from wishlist`}>Remove</button>
              </div>
            ))}
          </div>
        </section>

        {/* Address */}
        <section id="address" aria-labelledby="address-heading">
          <h2 id="address-heading" className="text-2xl font-bold mb-4">🏠 Address</h2>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p>{dummyData.address}</p>
            <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">Edit Address</button>
          </div>
        </section>

        {/* Settings */}
        <section id="settings" aria-labelledby="settings-heading">
          <h2 id="settings-heading" className="text-2xl font-bold mb-4">⚙️ Settings</h2>
          <div className="bg-white p-6 rounded-2xl shadow space-y-4">
            <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition">Change Password</button>
            <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition">Logout</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
