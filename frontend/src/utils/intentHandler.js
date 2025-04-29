

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


export const handleReset = (response,  contextValues) => {
  const { setSortType, resetFilters } = contextValues;

  const intent = response?.intent || "";

  if (intent.includes("reset_filter")) {
    resetFilters();
  } else {
    setSortType("relevant");
  }
};




export const handleSortByPriceLowToHigh = (response,  contextValues) => {
  const { setSortType } = contextValues;
  setSortType("low-high");
};

export const handleSortByPriceHighToLow = (response,  contextValues) => {
  const { setSortType } = contextValues;
  setSortType("high-low");
};

export const handleChooseParticularProduct = (response,  contextValues) => {
  const { filterProducts, navigate } = contextValues;

  const productNumber = response?.product?.number;

 
  if (productNumber != null && filterProducts?.length >= productNumber) {
    const product = filterProducts[productNumber - 1];
    if (product?._id) {
      navigate(`/product/${product._id}`);
    } else {
      console.error("Product ID not found!");
    }
  } else {
    console.error("Invalid product number or filterProducts not loaded!");
  }
};



export const handleCart = (response, contextValues) => {
  const { addToCart, updateQuantity, size, pageValues } = contextValues;
  const action = response?.userAction?.cart;
  const productData = pageValues?.values?.productData;

  if (!productData || !action) {
    console.error("Missing product data or action");
    return;
  }

  if (action === "add") {
    addToCart(productData._id, size);
  } else if (action === "remove") {
    updateQuantity(productData._id, size, 0);
  } else {
    console.warn("Unknown cart action:", action);
  }
};


export const handleQuantityAndRemoveFromCartPage = (response, contextValues) => {
  const {  updateQuantity,  pageValues,cartData } = contextValues;
  
  const removeProduct = cartData[Number(response.remove_product_number)-1]

  if (action === "adjust_quantity") {
    updateQuantity(removeProduct._id, removeProduct.size, response.quantity);

  } else if (action === "remove") {
    updateQuantity(removeProduct._id, removeProduct.size, 0);
  } else {
    console.warn("Unknown cart action:", action);
  }
};




export const handleWishlist = (response, contextValues) => {
  const { toggleWishlist, pageValues,setIsWishlisted } = contextValues;
  const product = pageValues?.values?.productData;
  const action = response?.userAction?.wishlist;

  if (!product || !action) {
    console.error("Missing product data or action");
    return;
  }

  if (action === "add") {
    setIsWishlisted(true)
    toggleWishlist(product._id);
  } else if (action === "remove") {
    setIsWishlisted(false)
    toggleWishlist(product._id);
  } else {
    console.warn("Unknown wishlist action:", action);
  }
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



export const handleSortByBestSeller = (response) => {
  console.log("Sorting by Best Seller", response);
};  

export const handleAskDetails = (response) => {
  console.log("Asking for Details", response);
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
