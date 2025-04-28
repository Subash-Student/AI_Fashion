

import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

export const handleNavigation = (response,contextValues) => {

  const {navigate} = contextValues;

  const { intent } = response;
  const target = intent.split("_")[1];

  
  if (target === "nextPage") {
    navigate(1); 
  }

  if (target === "priviousPage") {
    navigate(-1); 
    return;
  }

 
  const pathMap = {
    home: "/",
    about: "/about",
    contact: "/contact",
    orders: "/orders",
    dashboard: "/dashboard",
    collection: "/collection",
    wishlist: "/wishlist",
    cart: "/cart",
  };

  const to = pathMap[target];

  if (to) {
    navigate(to);
  } else {
    console.warn(`Unknown navigation target: ${target}`);
  }
};




export const handleLogout = (response) => {
  localStorage.removeItem("token");
  setToken("")
};


export const handleApplyFilter = (response, contextValues) => {
  const { 
    setSearch, 
    setShowSearch, 
    setCategory, 
    setSubCategory, 
    setMaterial, 
    setReturnable, 
    setInStock, 
    setPriceRange ,
    navigate,
  } = contextValues;

  const { searchItemName, filters } = response || {};
  const { category, subCategory, material, returnable, inStock, priceRange } = filters || {};

  setSearch(searchItemName || "");
  setShowSearch(true);

  setCategory(category || "");
  setSubCategory(subCategory || "");
  setMaterial(material || "");
  setReturnable(returnable || false);
  setInStock(inStock || false);
  setPriceRange(priceRange || [0, 5000]);

  navigate("/collection")
};






















export const handleLogin = (response) => {
  console.log("Handling login", response);
};

export const handleRegister = (response) => {
  console.log("Handling register", response);
};




export const handleSearchProduct = (response) => {
  console.log("Applying Filter", response);
};

export const handleSortByPriceLowToHigh = (response) => {
  console.log("Sorting by Price: Low to High", response);
};

export const handleSortByPriceHighToLow = (response) => {
  console.log("Sorting by Price: High to Low", response);
};

export const handleSortByBestSeller = (response) => {
  console.log("Sorting by Best Seller", response);
};

export const handleAskDetails = (response) => {
  console.log("Asking for Details", response);
};

export const handleChooseParticularProduct = (response) => {
  console.log("Choosing Particular Product", response);
};

export const handleAddToCart = (response) => {
  console.log("Adding to Cart", response);
};

export const handleAddToWishlist = (response) => {
  console.log("Adding to Wishlist", response);
};

export const handleRemoveFromCart = (response) => {
  console.log("Removing from Cart", response);
};

export const handleViewCart = (response) => {
  console.log("Viewing Cart", response);
};

export const handlePlaceOrder = (response) => {
  console.log("Placing Order", response);
};

export const handleSelectPaymentMethod = (response) => {
  console.log("Selecting Payment Method", response);
};

export const handleChangeShippingAddress = (response) => {
  console.log("Changing Shipping Address", response);
};

export const handleTrackOrder = (response) => {
  console.log("Tracking Order", response);
};

export const handleCancelOrder = (response) => {
  console.log("Cancelling Order", response);
};

export const handleReviewOrder = (response) => {
  console.log("Reviewing Order", response);
};

export const handleChangeName = (response) => {
  console.log("Changing Name", response);
};

export const handleChangePhoneNumber = (response) => {
  console.log("Changing Phone Number", response);
};

export const handleUpdateShippingAddress = (response) => {
  console.log("Updating Shipping Address", response);
};

export const handleReadTheContent = (response) => {
  console.log("Reading the Content", response);
};

export const handleRemoveFromWishlist = (response) => {
  console.log("Removing from Wishlist", response);
};

export const handleMakeCall = (response) => {
  console.log("Making a Call", response);
};
