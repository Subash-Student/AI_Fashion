
import { toast } from 'react-toastify';

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


export const handlePlaceOrder = (response) => {


  window.dispatchEvent(new CustomEvent('voice_place_order'));


};


export const handleChangeShippingAddress = (response,contextValues) => {
  
  const{showPincodeModal, setShowPincodeModal} = contextValues;

  setShowPincodeModal(true);

};


const findProductByName = (orderData, name) => {
  const lowerName = name.trim().toLowerCase();

  
  let match = orderData.find(item =>
    item?.name?.trim().toLowerCase() === lowerName
  );

  
  if (!match) {
    const fuzzyMatches = orderData.filter(item =>
      item?.name?.toLowerCase().includes(lowerName)
    );

    if (fuzzyMatches.length === 1) {
      match = fuzzyMatches[0];
    } else if (fuzzyMatches.length > 1) {
      toast.warn(`Multiple products matched "${name}". Please be more specific.`);
    }
  }

  return match;
};

export const handleTrackOrder = (response, contextValues) => {
  const { orderData, handleTrackOrder: openTrackModal } = contextValues;
  const product = findProductByName(orderData, response.productName);

  if (product) {
    openTrackModal(product.status);
  } else {
    toast.error(`Product "${response.productName}" not found in your orders.`);
  }
};

export const handleCancelOrder = (response, contextValues) => {
  const { orderData, handleCancelOrder: openCancelModal } = contextValues;
  const product = findProductByName(orderData, response.productName);

  if (product) {
    openCancelModal(product);
  } else {
    toast.error(`Product "${response.productName}" not found in your orders.`);
  }
};

export const handleReviewOrder = (response, contextValues) => {
  const { orderData, handleOpenReview } = contextValues;
  const product = findProductByName(orderData, response.productName);

  if (product) {
    handleOpenReview(product._id);
  } else {
    toast.error(`Product "${response.productName}" not found in your orders.`);
  }
};


export const handleUpdateShippingAddress = (response,contextValues) => {
  const{showPincodeModal, setShowPincodeModal} = contextValues;

  setShowPincodeModal(true);

};


export const handleChangeName = (response,contextValues) => {
  
  const {setShowModel} = contextValues;

  setShowModel(true);


};

export const handleChangePhoneNumber = (response,contextValues) => {
  const {setShowModel} = contextValues;

  setShowModel(true);

};


export const handleMakeCall = (response) => {

  const phone = "9788306886"
  if (!phone || phone.length < 10) {
    console.error("Invalid phone number:", phone);
    alert("Invalid phone number provided.");
    return;
  }

  const telUrl = `tel:${phone}`;
  console.log("Making a Call to", telUrl);

  // Open the phone dialer
  window.location.href = telUrl;
};









export const handleReadTheContent = (response) => {
  console.log("Reading the Content", response);
};


export const handleLogin = (response) => {
  console.log("Handling login", response);
};  

export const handleRegister = (response) => {
  console.log("Handling register", response);
};  

export const handleAskDetails = (response) => {
  console.log("Asking for Details", response);
};  
