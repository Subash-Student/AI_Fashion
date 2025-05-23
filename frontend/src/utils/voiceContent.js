export const getProductPageSummary = (product) => {
    const fallback = checkPageVisited("productPage", "You are on the Product Page.");
    if (fallback) return fallback;

    const productName = product.name || "Product";
    return `Welcome to the product page for ${productName}. ${product.description}. We hope you enjoy your shopping experience!`;
};

export const getOrdersPageSummary = (orderData) => {
    const fallback = checkPageVisited("ordersPage", "You are on the Orders Page.");
    if (fallback) return fallback;

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

export const getPlaceOrderPageSummary = (getCartAmount, address, delivery_fee) => {
    const fallback = checkPageVisited("placeOrderPage", "You are on the Place Order Page.");
    if (fallback) return fallback;

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
    const fallback = checkPageVisited("homePage", "You are on the Home Page.");
    if (fallback) return fallback;

    return `Welcome to the home page. Explore our latest collections, best sellers, and new arrivals for men, women, and kids.`;
};

export const getCollectionPageSummary = (products) => {
    const visitedPages = JSON.parse(sessionStorage.getItem("visitedPages")) || {};

    if (!visitedPages.collectionPage) {
        visitedPages.collectionPage = "visited";
        sessionStorage.setItem("visitedPages", JSON.stringify(visitedPages));
        return `Welcome to the collections page. 
            Use the filters on the products items by category, type, material, returnability, availability, and price. 
            You can also sort the results by price.  
            To open a product, say open product name to view the product name.`;
    } else {
        const productSummaries = products.map((product, index) => {
            return `Product ${index + 1}: ${product.name}, priced at ₹${product.price}.`;
        }).join(" ");
        return `You are on the Collections Page. ${productSummaries}`;
    }
};


export const getDashboardPageSummary = (allUserData) => {
    const fallback = checkPageVisited("dashboardPage", "You are on the Dashboard Page.");
    if (fallback) return fallback;

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
    const fallback = checkPageVisited("cartPage", "You are on the Cart Page.");
    if (fallback) return fallback;

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

export const getContactPageSummary = () => {
    const fallback = checkPageVisited("contactPage", "You are on the Contact Page.");
    if (fallback) return fallback;

    return "Welcome to our Contact Page! You can find us at 54709 Willms Station, Suite 350, Washington, USA. If you need any help or have questions, feel free to call us at 415-555-0132 or email us at admin@forever.com. For direct assistance in India, you can also reach us at +91 97883 06886. We're always here to help!";
};

export const getAboutPageSummary = () => {
    const fallback = checkPageVisited("aboutPage", "You are on the About Page.");
    if (fallback) return fallback;

    return "Welcome to FeelWays! We’re a fashion platform built with heart and innovation—designed especially to empower visually impaired individuals. Our goal is simple: to make online shopping more inclusive through voice-powered and AI-driven technology. From stylish dresses to smart, accessible experiences, everything we do is centered around ease, independence, and confidence. At FeelWays, we believe everyone deserves to shop with freedom—guided by voice, supported by AI, and delivered with care. We promise top-quality products, a smooth shopping experience, and exceptional support—every step of the way.";
};

const checkPageVisited = (key, defaultMessage) => {
    const visited = JSON.parse(sessionStorage.getItem("pageVisit") || "{}");

    if (visited[key]) {
        return defaultMessage;
    }

    // Mark page as visited
    visited[key] = "visited";
    sessionStorage.setItem("pageVisit", JSON.stringify(visited));

    return null; // Means: not visited, return full content
};


// Start speaking
export const textToSpeech = (speechText) => {
    if (!speechText) return;
    
    // Stop any ongoing speech before starting new one
    window.speechSynthesis.cancel();
  
    const speech = new SpeechSynthesisUtterance(speechText);
  
    // More natural sounding settings
    speech.rate = 1.0; // Slightly faster than default (1.0 is normal speed)
    speech.pitch = 0.9; // Slightly lower pitch sounds more natural
    speech.volume = 1;
    
    // Wait for voices to be loaded
    const loadVoices = new Promise(resolve => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    });
  
    loadVoices.then(voices => {
      // Prefer voices that are marked as "natural" sounding
      const naturalVoices = voices.filter(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Premium') ||
        voice.name.includes('Neural')
      );
      
      // Select the best available voice
      const selectedVoice = naturalVoices.find(voice => voice.lang === 'en-US') || 
                           voices.find(voice => voice.lang === 'en-US') || 
                           voices[0];
      
      if (selectedVoice) {
        speech.voice = selectedVoice;
      }
      
      // Add slight pauses between sentences for more natural rhythm
      speech.text = speechText.replace(/\. /g, '. ');
  
      // Speak the text
      window.speechSynthesis.speak(speech);
    });
  };
  
  
  // Stop speaking
  export const stopSpeech = () => {
    window.speechSynthesis.cancel();
  };
  
let currentAudio;

// export const stopSpeech = () => {
//   if (currentAudio) {
//     currentAudio.pause();
//     currentAudio.currentTime = 0;
//   }
// };

// export const textToSpeech = async (speechText) => {
//   if (!speechText) return;

//   try {
//     const response = await fetch("https://api.openai.com/v1/audio/speech", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${import.meta.env.VITE_GPT_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         model: "tts-1",
//         input: speechText,
//         voice: "echo"
//       })
//     });

//     if (!response.ok) {
//       console.error("OpenAI TTS Error", await response.json());
//       return;
//     }

//     const audioBlob = await response.blob();
//     const audioUrl = URL.createObjectURL(audioBlob);
//     currentAudio = new Audio(audioUrl);
//     currentAudio.play();
//   } catch (error) {
//     console.error("OpenAI TTS Failed:", error);
//   }
// };
