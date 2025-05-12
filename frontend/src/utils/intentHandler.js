import { toast } from 'react-toastify';
import { textToSpeech } from './voiceContent';


// Vibration Pattern Utility
const vibratePattern = (pattern) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

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

// Function to provide voice feedback
const provideVoiceFeedback = (message) => {
  textToSpeech(message);
};

const handleNavigationAction = (target, navigate) => {
  if (target === "nextPage") {
    vibratePattern([100]); // Confirm successful navigation
    provideVoiceFeedback("Navigated to the next page.");
    return navigate(1);
  }
  if (target === "priviousPage") {
    vibratePattern([100]); // Confirm successful navigation
    provideVoiceFeedback("Navigated to the previous page.");
    return navigate(-1);
  }
  const to = pathMap[target];
  if (to) {
    vibratePattern([100]); // Confirm successful navigation
    provideVoiceFeedback(`Navigated to the ${target} page.`);
    navigate(to);
  } else {
    vibratePattern([200, 100, 200]); // Error vibration
    provideVoiceFeedback(`Unknown navigation target: ${target}. Please try again.`);
    console.warn(`Unknown navigation target: ${target}`);
  }
};

export const handleNavigation = (response, { navigate }) => {
  handleNavigationAction(response.intent.split("_")[1], navigate);
};

export const handleLogout = (response,contextValues) => {
  localStorage.removeItem("token");
  const {setToken} = contextValues;
  setToken("");
  vibratePattern([100, 50, 100]); // Confirm logout
  provideVoiceFeedback("You have logged out successfully.");
};

const updateFilterState = ( response,contextValues) => {
  const { filters = {}, searchItemName } = response || {};
  const {
    setSearch, setShowSearch, setCategory, setSubCategory, setMaterial,
    setReturnable, setInStock, setPriceRange
  } = contextValues;

  setSearch(searchItemName || "");
  setShowSearch(true);
  setCategory(filters.category || "");
  setSubCategory(filters.subCategory || "");
  setMaterial(filters.material || "");
  setReturnable(filters.returnable || false);
  setInStock(filters.inStock || false);
  setPriceRange(filters.priceRange || [0, 5000]);

  vibratePattern([50, 50, 50]); // Feedback for applying filters
  provideVoiceFeedback("Filters applied successfully.");
};

export const handleApplyFilter = (response, contextValues) => {
  updateFilterState(contextValues, response);
  contextValues.navigate("/collection");
  vibratePattern([50, 50, 50]); // Feedback for applying filters
  provideVoiceFeedback("Filters have been applied and you are redirected to the collection page.");
};

export const handleReset = (response, { setSortType, resetFilters }) => {
  if (response?.intent?.includes("reset_filter")) {
    resetFilters();
    vibratePattern([100, 50, 100]); // Reset feedback
    provideVoiceFeedback("Filters have been reset.");
  } else {
    setSortType("relevant");
    vibratePattern([100, 50, 100]); // Sorting feedback
    provideVoiceFeedback("Sort option has been set to relevant.");
  }
};

const handleSort = (contextValues, sortType) => {
  contextValues.setSortType(sortType);
  vibratePattern([100, 50, 100]); // Sort feedback
  provideVoiceFeedback(`Sorted by ${sortType === "low-high" ? "price low to high" : "price high to low"}.`);
};

export const handleSortByPriceLowToHigh = (_, contextValues) => handleSort(contextValues, "low-high");
export const handleSortByPriceHighToLow = (_, contextValues) => handleSort(contextValues, "high-low");

const handleProductAction = (response, contextValues, action) => {
  const { filterProducts, navigate } = contextValues;
  const productNumber = response?.product?.number;

  if (productNumber == null || filterProducts?.length < productNumber) {
    vibratePattern([200, 100, 200]); // Error vibration for invalid product number
    provideVoiceFeedback("Invalid product number or product not found.");
    return console.error("Invalid product number or filterProducts not loaded!");
  }

  const product = filterProducts[productNumber - 1];
  if (product?._id) {
    vibratePattern([120]); // Product selected feedback
    provideVoiceFeedback(`Navigating to the product page for ${product.name}.`);
    navigate(`/product/${product._id}`);
  } else {
    vibratePattern([200, 100, 200]); // Error vibration
    provideVoiceFeedback("Product ID not found.");
    console.error("Product ID not found!");
  }
};

export const handleChooseParticularProduct = (response, contextValues) => {
  handleProductAction(response, contextValues);
};

const handleCartAction = (contextValues, action, productId, size, quantity = 0) => {
  const { addToCart, updateQuantity } = contextValues;
  if (action === "add") {
    addToCart(productId, size);
    vibratePattern([100, 50, 100]); // Cart add confirmation
    provideVoiceFeedback("Product added to the cart.");
  } else {
    updateQuantity(productId, size, quantity);
    vibratePattern([100, 50, 100]); // Cart quantity adjustment confirmation
    provideVoiceFeedback(`Cart updated with quantity: ${quantity}.`);
  }
};

export const handleCart = (response, contextValues) => {
  const { size, pageValues } = contextValues;
  const action = response?.userAction?.cart;
  const productData = pageValues?.values?.productData;

  if (!productData || !action) {
    vibratePattern([200, 100, 200]); // Error vibration
    provideVoiceFeedback("Missing product data or action.");
    return console.error("Missing product data or action");
  }
  handleCartAction(contextValues, action, productData._id, size);
};

export const handleQuantityAndRemoveFromCartPage = (response, contextValues) => {
  const { cartData } = contextValues;
  const product = cartData[Number(response.remove_product_number) - 1];
  const action = response.action;

  if (!["adjust_quantity", "remove"].includes(action)) {
    vibratePattern([200, 100, 200]); // Error vibration
    provideVoiceFeedback("Unknown cart action.");
    return console.warn("Unknown cart action:", action);
  }

  handleCartAction(contextValues, action, product._id, product.size, action === "adjust_quantity" ? response.quantity : 0);
};

export const handleWishlist = (response, contextValues) => {
  const { toggleWishlist, pageValues, setIsWishlisted } = contextValues;
  const product = pageValues?.values?.productData;
  const action = response?.userAction?.wishlist;

  if (!product || !action) {
    vibratePattern([200, 100, 200]); // Error vibration
    provideVoiceFeedback("Missing product data or action.");
    return console.error("Missing product data or action");
  }

  setIsWishlisted(action === "add");
  toggleWishlist(product._id);
  vibratePattern([100, 50, 100]); // Wishlist action feedback
  provideVoiceFeedback(`Product ${action === "add" ? "added to" : "removed from"} wishlist.`);
};

export const handlePlaceOrder = () => {
  vibratePattern([500]); // Confirm place order
  provideVoiceFeedback("Order placed successfully.");
  window.dispatchEvent(new CustomEvent('voice_place_order'));
};

const toggleModal = (setter) => setter(true);

export const handleChangeShippingAddress = (_, { setShowPincodeModal }) => {
  toggleModal(setShowPincodeModal);
  vibratePattern([100, 50, 100]); // Shipping address change feedback
  provideVoiceFeedback("Changing shipping address.");
};

export const handleUpdateShippingAddress = (_, { setShowPincodeModal }) => {
  toggleModal(setShowPincodeModal);
  vibratePattern([100, 50, 100]); // Shipping address update feedback
  provideVoiceFeedback("Updating shipping address.");
};

const handleOrderAction = (response, contextValues, handler) => {
  const product = findProductByName(contextValues.orderData, response.productName);
  product ? handler(product) : toast.error(`Product "${response.productName}" not found in your orders.`);
};

const findProductByName = (orderData, name) => {
  const lowerName = name.trim().toLowerCase();
  let match = orderData.find(item => item?.name?.trim().toLowerCase() === lowerName);
  
  if (!match) {
    const fuzzyMatches = orderData.filter(item => item?.name?.toLowerCase().includes(lowerName));
    if (fuzzyMatches.length === 1) match = fuzzyMatches[0];
    else if (fuzzyMatches.length > 1) toast.warn(`Multiple products matched "${name}". Please be more specific.`);
  }
  return match;
};

export const handleTrackOrder = (response, contextValues) => handleOrderAction(response, contextValues, p => contextValues.handleTrackOrder(p.status));
export const handleCancelOrder = (response, contextValues) => handleOrderAction(response, contextValues, contextValues.handleCancelOrder);
export const handleReviewOrder = (response, contextValues) => handleOrderAction(response, contextValues, p => contextValues.handleOpenReview(p._id));


export const handleChangeName = (_, { setShowModel }) => {
  toggleModal(setShowModel);
  vibratePattern([100, 50, 100]); // Name change feedback
  provideVoiceFeedback("Changing name.");
};

export const handleChangePhoneNumber = (_, { setShowModel }) => {
  toggleModal(setShowModel);
  vibratePattern([100, 50, 100]); // Phone number change feedback
  provideVoiceFeedback("Changing phone number.");
};

export const handleMakeCall = () => {
  const phone = "9788306886";
  if (!phone || phone.length < 10) {
    vibratePattern([200, 100, 200]); // Invalid number error
    provideVoiceFeedback("Invalid phone number provided.");
    return alert("Invalid phone number provided.");
  }
  window.location.href = `tel:${phone}`;
  vibratePattern([200, 50, 100]); // Call initiation feedback
  provideVoiceFeedback("Making a call.");
};


export const handleReadTheContent = (_, { pageValues }) => {
  textToSpeech(pageValues.pageContent);
};


export const handleAskDetails = async(_, { pageValues }) => {
  const { speechText, question } = { ...pageValues, ...response };
  if (!speechText || !question) return;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant. Read the context and answer the question clearly in a short sentence." },
          { role: "user", content: `Context:\n${speechText}\n\nQuestion: ${question}` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    textToSpeech(answer || "Sorry, I could not find an answer.");
    vibratePattern([300]); // Feedback for reading the answer
    provideVoiceFeedback(answer || "Sorry, I could not find an answer.");
  } catch (error) {
    console.error("Error in GPT API call:", error);
    textToSpeech("There was an error answering your question.");
    vibratePattern([200, 100, 200]); // Error feedback
    provideVoiceFeedback("There was an error answering your question.");
  }
};

export const handleLogin = (response,contextValues) => {
 
  const{navigate} = contextValues;

  navigate("/login")

};
export const handleRegister = (response,contextValues) => {
  const{navigate} = contextValues;

  navigate("/login")
};
export const handleReviews = (response, contextValues) => {
  const { pageValues, textToVoice } = contextValues;

  const reviewActivity = response.reviewAction;
  const productReviews = pageValues.values.productData.reviews;

  // Step 1: Filter reviews
  let filteredReviews = [];

  if (reviewActivity === "read_best_reviews") {
    filteredReviews = productReviews.filter(r => r.rating >= 4);
  } else if (reviewActivity === "read_bad_reviews") {
    filteredReviews = productReviews.filter(r => r.rating <= 2);
  } else {
    filteredReviews = productReviews; // "read_all_reviews"
  }

  // Step 2: Convert to human-readable sentences
  const readableReviews = filteredReviews.map(review => {
    const date = new Date(review.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    return `${review.userName} said: "${review.review}" on ${date}. Rating: ${review.rating} star${review.rating !== 1 ? 's' : ''}.`;
  });

  // Step 3: Join all sentences
  const finalReviewText = readableReviews.join(" ");

  // Step 4: Call textToVoice
  if (finalReviewText) {
    textToSpeech(finalReviewText);
  } else {
    textToSpeech("No reviews found based on your selection.");
  }
};


