import { toast } from 'react-toastify';
import { textToSpeech } from './voiceContent';
import stringSimilarity from 'string-similarity';
import { products } from '../assets/assets';


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
  provideVoiceFeedback("You have logged out successfully.");
  vibratePattern([100, 50, 100]); // Confirm logout
  setTimeout(()=>{
    localStorage.removeItem("token");
    const {setToken,navigate} = contextValues;
    setToken("");
    navigate("/")
  },1500)
};

const updateFilterState = ( response,contextValues) => {
  const { filters = {}, searchItemName } = response.fields || {};
  const {
    setSearch,products, setShowSearch, setCategory, setSubCategory, setMaterial,
    setReturnable, setInStock, setPriceRange
  } = contextValues;
console.log(filters)


if(searchItemName !== "unknow"){
  const product = findProductByName(products,searchItemName,false)

  setSearch(product.name) 
  setShowSearch(true)
}else{
  filters.category !== "unknown" ? setCategory(filters.category) : null;
  filters.subCategory !== "unknown" ? setSubCategory(filters.subCategory) : null;
  filters.material !== "unknown" ? setMaterial(filters.material) : null; 
  filters.returnable !=="unknown" ? setReturnable(filters.returnable) : setReturnable(null);
  filters.inStock !=="unknown"? setInStock( filters.inStock) : setInStock(null);
    setSearch("")
    setPriceRange(filters.priceRange || [0, 5000]);
}

  vibratePattern([50, 50, 50]); // Feedback for applying filters
  provideVoiceFeedback("Filters applied successfully.");
};

export const handleApplyFilter = (response, contextValues) => {
  updateFilterState(response,contextValues);
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

  console.log({response, contextValues, action})
  const { filterProducts,setFilterProducts, navigate,products } = contextValues;
  const searchItemName = response.fields.searchItemName;

  if(action === "particular"){
    const product = findProductByName(products,searchItemName,false)
    if (!product) {
      vibratePattern([200, 100, 200]); // Error vibration for invalid product number
      provideVoiceFeedback("Invalid product name or product not found.");
      return console.error("Invalid product name or filterProducts not loaded!");
    }
    if (product?._id) {
      vibratePattern([120]); // Product selected feedback
      provideVoiceFeedback(`Navigating to the product page for ${product.name}.`);
      navigate(`/product/${product._id}`);
    } else {
      vibratePattern([200, 100, 200]); // Error vibration
      provideVoiceFeedback("Product ID not found.");
      console.error("Product ID not found!");
    }
  }else{
        const product = findProductByName(products,searchItemName,true);
        setFilterProducts(product);
        navigate("/collection")
        vibratePattern([50, 50, 50]); // Feedback for applying filters
        provideVoiceFeedback("hear is your result.");
  }
};

export const handleChooseParticularProduct = (response, contextValues) => {
  handleProductAction(response, contextValues),"particular";
};
export const searchCommonProducts = (response, contextValues) => {
  handleProductAction(response, contextValues,"common");
};

const handleCartAction = async(contextValues, action, productId, size, quantity = 0) => {
  const { addToCart, updateQuantity } = contextValues;
  if (action === "add") {
     addToCart(productId, size);
    vibratePattern([100, 50, 100]); // Cart add confirmation
    provideVoiceFeedback("Product added to the cart.");
  } else {
    updateQuantity(productId, size, quantity);
    vibratePattern([100, 50, 100]); // Cart quantity adjustment confirmation
    provideVoiceFeedback(`Product remove from the cart.`);
  }
};

export const handleCart = (response, contextValues) => {
  const { size, pageValues } = contextValues;

  const productData = pageValues?.values?.productData;
  const action = response?.fields.userAction?.cart;
  if (!productData ) {
    vibratePattern([200, 100, 200]); // Error vibration
    provideVoiceFeedback("Missing product data or action.");
    return console.error("Missing product data ");
  }
  if(!size){
    vibratePattern([200, 100, 200]); // Error vibration
    return provideVoiceFeedback("Please choose the size");
  } 

  handleCartAction(contextValues, action, productData._id, size);
};


export const selectSize = (response,contextValues)=>{
  const {setSize} = contextValues;

  const size = response.fields.size;

  setSize(size)

}


export const handleQuantityAndRemoveFromCartPage = (response, contextValues) => {
  const { cartData } = contextValues;
  // const product = findProductByName(cartData,response.fields.productName)
  const product = cartData[Number(response.fields.product_number_for_action) - 1]; 
  const action = response.fields.action;

  if (!["adjust_quantity", "remove"].includes(action)) {
    vibratePattern([200, 100, 200]); // Error vibration
    provideVoiceFeedback("Unknown cart action.");
    return console.warn("Unknown cart action:", action);
  }

  handleCartAction(contextValues, action, product._id, product.size, action === "adjust_quantity" ? response.fields.quantity : 0);
};

export const handleWishlist = (response, contextValues) => {
  const { toggleWishlist, pageValues, setIsWishlisted } = contextValues;
  const product = pageValues?.values?.productData;
  const action = response?.fields.userAction?.wishlist;

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
  vibratePattern([100, 50, 100]); // Shipping address change feedback
  provideVoiceFeedback("Changing shipping address.");
  setTimeout(()=>{
    toggleModal(setShowPincodeModal);

  },1500);
};

export const handleUpdateShippingAddress = (_, { setShowPincodeModal }) => {
  toggleModal(setShowPincodeModal);
  vibratePattern([100, 50, 100]); // Shipping address update feedback
  provideVoiceFeedback("Updating shipping address.");
};

export const handleChangeName = (_, { setShowModal }) => {
  toggleModal(setShowModal);
  vibratePattern([100, 50, 100]); // Name change feedback
  provideVoiceFeedback("Changing name.");
};

export const handleChangePhoneNumber = (_, { setShowModal }) => {
  toggleModal(setShowModal);
  vibratePattern([100, 50, 100]); // Phone number change feedback
  provideVoiceFeedback("Changing phone number.");
};



const handleOrderAction = (response, contextValues, handler) => {
  const product = findProductByName(contextValues.orderData, response.fields.productName);
  product ? handler(product) : toast.error(`Product "${response.fields.productName}" not found in your orders.`);
};


const normalizeName = (name = '') =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // Remove symbols
    .replace(/\s+/g, ' ')       // Collapse spaces
    .trim();

    const findProductByName = (orderData, name, isFilter) => {
      const normalizedInput = normalizeName(name);
      const productNames = orderData.map(item => normalizeName(item.name));
    
      const matches = stringSimilarity.findBestMatch(normalizedInput, productNames);
    
      if (isFilter) {
        // Return all products with similarity >= 0.5
        const filteredProducts = matches.ratings
          .map((match, index) => ({ ...match, index }))
          .filter(match => match.rating >= 0.5)
          .map(match => orderData[match.index]);
    
        if (filteredProducts.length === 0) {
          toast.error(`No products found with at least 50% match for "${name}".`);
        }
    
        return filteredProducts;
      } else {
        const bestMatch = matches.bestMatch;
    
        if (bestMatch.rating >= 0.8) {
          return orderData[matches.bestMatchIndex];
        } else if (bestMatch.rating >= 0.6) {
          toast.warn(`Closest match is "${orderData[matches.bestMatchIndex].name}" (low confidence).`);
          return orderData[matches.bestMatchIndex];
        } else {
          toast.error(`No good match found for "${name}".`);
          return null;
        }
      }
    };
    



export const handleTrackOrder = (response, contextValues) => handleOrderAction(response, contextValues, p => contextValues.handleTrackOrder(p.status));
export const handleCancelOrder = (response, contextValues) => handleOrderAction(response, contextValues, contextValues.handleCancelOrder);
export const handleReviewOrder = (response, contextValues) => handleOrderAction(response, contextValues, p => contextValues.handleOpenReview(p._id));



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


export const handleAskDetails = async(response,contextValues) => {
  const {pageValues} = contextValues;
  const speechText = pageValues.pageContent;
  const question = response.fields.question;
  console.log(response)
  console.log({speechText,question})
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


export const readyToCheckOut = (response,contextValues)=>{

  const {navigate} = contextValues;

 textToSpeech("Yeah sure, Thanks for Your comfirmation");
 setTimeout(()=>{
   navigate('/place-order')
 },2000)
}