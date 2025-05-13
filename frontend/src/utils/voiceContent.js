export const getProductPageSummary = (product) => {

    const productName = product.name || "Product";
    const productPrice =   product.price;
    const productBrand = product.brand || "Unknown Brand";
    const productRating = product.averageRating || 0;
    const reviewsCount = product.reviews ? product.reviews.length : 0;
    const availableSizes = product.sizes ? product.sizes.join(", ") : "No sizes available";
    const availableColors = product.colorOptions || "No colors available";
    const occasion = product.occasion || "Not specified";
    const material = product.material || "Material not specified";
    const sleeveType = product.sleeveType || "Not specified";
    const neckType = product.neckType || "Not specified";
    const pattern = product.pattern || "Not specified";
    const washCare = product.washCare || "Wash care instructions not provided";
    const inStock = product.inStock ? "Yes" : "No";
    const returnable = product.returnable ? "Yes" : "No";
  
    const data = {
    productPrice,
     productBrand,
     productRating ,
     reviewsCount, 
     availableSizes,
     availableColors,
     occasion ,
     material, 
     sleeveType, 
     neckType ,
     pattern ,
     washCare ,
     inStock ,
     returnable 
    }

    return {
        text:`Welcome to the product page for ${productName}. ${product.description}. We hope you enjoy your shopping experience!`,
        data: data
    }
  };

  export const getOrdersPageSummary = (orderData) => {
    if (orderData && orderData.length > 0) {
        return orderData.map(item => {
            const statusText = item.status.toLowerCase();
            let statusMessage = '';
            if (statusText === 'delivered') {
                statusMessage = "This order has been delivered.";
            } else if (statusText === 'canceled') {
                statusMessage = "This order has been canceled.";
            } else if (statusText === 'shipped' || statusText === 'out for delivery') {
                statusMessage = `Your order is ${item.status.toLowerCase()}.`;
            } else {
                statusMessage = `Your order is currently in progress.`;
            }

            return `Order for ${item.name}, quantity: ${item.quantity}, size: ${item.size}. Price: ${item.price} rupees. Payment Method: ${item.paymentMethod}. Date: ${new Date(item.date).toDateString()}. Status: ${statusMessage}`;
        }).join(' ');
    }
    return '';
};

export const getPlaceOrderPageSummary = (getCartAmount,address,delivery_fee) => {
    const subtotal = getCartAmount();
    const shipping = delivery_fee;
    const total = subtotal === 0 ? 0 : subtotal + shipping;

    const addressSummary = address
        ? `Your current delivery address is: ${address}.`
        : `No address is set yet. Please provide one.`;

    const totalSummary = subtotal === 0
        ? `Your cart is empty. Add some items before placing an order.`
        : `Your cart subtotal is  ${subtotal} rupees, shipping fee is  ${shipping} rupees, and the total comes to  ${total} rupees.`;

    const paymentSummary = `Currently, payment method is set to Cash on Delivery.`;

    const finalSummary = `When you're ready, tap the Place Order button to complete your purchase.`;

    return `Welcome to the Place Order page. ${addressSummary} ${totalSummary} ${paymentSummary} ${finalSummary}`;
};

export const getHomePageSummary = () => {
    return `Welcome to the home page. Explore our latest collections, best sellers, and new arrivals for men, women, and kids.`;
};

export const getCollectionPageSummary = () => {
    return `Welcome to the collections page. 
        Use the filters on the left to explore items by category, type, material, returnability, availability, and price. 
        You can also sort the results by relevance or price. 
        Products are listed on the right side, each assigned a number starting from one. 
        To open a product, say or click open product one, open product two, and so on, based on its position. 
        For example, say open product one to view the first product.`;
};

export const getDashboardPageSummary = (allUserData) => {
    const { profile, orders = [] } = allUserData;
    const wishlist = profile?.wishlist || [];
    const address = profile?.address || "no address set";

    return `Welcome to your dashboard. 
        Your name is ${profile.name}. Your phone number is ${profile.phone}.
        You have ${orders.length} orders. ${orders.length > 0 ? orders.map((order, i) =>
            `Order ${i + 1} is ${order.name}, priced at ₹${order.price}, and its status is ${order.status}.`).join(' ') : 'No orders yet.'}
        You have ${wishlist.length} items in your wishlist. ${wishlist.length > 0 ? wishlist.map((item, i) =>
            `Wishlist item ${i + 1} is ${item.name}, priced at ₹${item.price}.`).join(' ') : 'Your wishlist is empty.'}
        Your address is currently set to: ${address}.
        Use the settings section to change your password or logout.`;
};

export const getCartPageSummary = (cartData, products, deliveryFee, getCartAmount) => {
    let cartItemsSummary = "Your cart contains the following items: ";

    if (cartData.length > 0) {
        cartData.forEach((item, index) => {
            const productData = products.find((product) => product._id === item._id);
            const itemName = productData?.name || "unknown product";
            const itemPrice = productData?.price || 0;
            const itemSize = item.size || "no size";
            const itemQuantity = item.quantity || 0;

            cartItemsSummary += `Product ${index + 1}: ${itemName}, size ${itemSize}, quantity ${itemQuantity}, priced at ${itemPrice * itemQuantity} rupees. `;
        });
    } else {
        cartItemsSummary = "Your cart is empty.";
    }

    const subtotal = getCartAmount();
    const totalAmount = subtotal + deliveryFee;

    return `${cartItemsSummary}
        Your subtotal is ${subtotal} rupees. 
        The shipping fee is ${deliveryFee} rupees. 
        The total amount to be paid is ${totalAmount} rupees.`;
};






// Start speaking
export const textToSpeech = (speechText) => {
    if (speechText) {
      // Stop any ongoing speech before starting new one
      window.speechSynthesis.cancel();
  
      const speech = new SpeechSynthesisUtterance(speechText);
  
      // Configure settings
      speech.rate = 0.9;
      speech.pitch = 1;
      speech.volume = 1;
  
      // Select a voice
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.lang === 'en-US') || voices[0];
      speech.voice = selectedVoice;
  
      // Speak the text
      window.speechSynthesis.speak(speech);
    }
  };
  
  // Stop speaking
  export const stopSpeech = () => {
    window.speechSynthesis.cancel();
  };
  
  