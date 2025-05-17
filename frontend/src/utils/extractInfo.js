import { arrayOfIntents } from "./intentMap";
import {
  handleLogin,
  handleRegister,
  handleLogout,
  handleNavigation,
  handleApplyFilter,
  handleSortByPriceLowToHigh,
  handleSortByPriceHighToLow,
  handleAskDetails,
  handleChooseParticularProduct,
  handleCart,
  handleWishlist,
  handleQuantityAndRemoveFromCartPage,
  handlePlaceOrder,
  handleChangeShippingAddress,
  handleTrackOrder,
  handleCancelOrder,
  handleReviewOrder,
  handleChangeName,
  handleChangePhoneNumber,
  handleUpdateShippingAddress,
  handleReadTheContent,
  
  handleMakeCall,
  handleReset,
  handleReviews,
  selectSize,
  readyToCheckOut
} from './intentHandler';

import axios from "axios";
import { stopSpeech, textToSpeech } from "./voiceContent";



export const extractInformation = async (voiceInputText, contextValues) => {
  const { pageValues } = contextValues;
  const { currentPage } = pageValues;

  try {
    // 1. Find page config
    const pageConfig = arrayOfIntents.find((item) => item.page === currentPage);
    if (!pageConfig) {
      return { error: `No configuration found for page: ${currentPage}` };
    }
   

    const commonConfig = arrayOfIntents[0];
console.log(pageConfig)
    const { intents, responseStructure } = pageConfig;

    // 2. Construct prompt for GPT-3.5 Turbo
    const prompt = `
    You are an AI assistant for an e-commerce platform that assists blind users. Your task is to process user voice input and match it to the correct intent based on the current page context. You will then structure the extracted information in a defined JSON format.

    **Current page**: "${currentPage}"
    
    Here are the valid intents for this page:
    ${JSON.stringify(intents, null, 2)}
    
    If the voice input doesn't match any of the above intents, check the common intents for the platform:
    ${JSON.stringify(commonConfig.intents, null, 2)}
    
    Here is the expected response structure for this page:
    ${JSON.stringify(responseStructure, null, 2)}
    
    **User voice input**:
    "${voiceInputText}"
    
    Instructions:
    - Based on the user's input, identify the best matching intent from the list above.
    - If a match is found, fill in the relevant fields from the response structure.
    - If a field cannot be confidently determined, mark it as "unknown".
    - some fileds in response structure have only some values should be allowed it mentioned in that keys values like category:"'Men', 'Women', 'Kids'", should be in this.
    - The response must be returned in valid JSON format. If any part of the input is unclear or does not fit, mark it as "unknown".
    - Ensure the response structure is clear, consistent, and easily understandable, especially for users relying on screen readers.
    
    **Response format**:
    {
      "intent": "<matched_intent>",
      "fields": {
        "field1": "<value_or_unknown>",
        "field2": "<value_or_unknown>",
        ...
      }
    }
    
`;

    // 3. Call GPT-3.5 Turbo API
    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 300
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`,
        },
      }
    );

    const content = gptResponse?.data?.choices?.[0]?.message?.content;

    if (!content) {
      return { error: "No response from GPT." };
    }

    // 4. Parse the result
    let result;
    try {
      result = JSON.parse(content);
    } catch (err) {
      return { error: "Failed to parse GPT response as JSON." };
    }

    // 5. Validate result fields to match expected structure
    const validateFields = (template, output) => {
      const validated = {};
      for (const key in template) {
        if (typeof template[key] === "object" && template[key] !== null) {
          validated[key] = validateFields(template[key], output[key] || {});
        } else {
          validated[key] = output?.[key] ?? "unknown";
          if (validated[key] === null || validated[key] === "") {
            validated[key] = "unknown";
          }
        }
      }
      return validated;
    };

    const finalResponse = validateFields(responseStructure, result);
   console.log(result)
    // 6. Process intent action based on final response
    handleIntent(result, contextValues);
  } catch (error) {
    console.error("Error in extractInformation:", error.message);
    return { error: "Something went wrong during intent extraction." };
  }
};





export const handleIntent = (finalResponse, contextValues) => {
  const intentHandlers = {
    // Authentication
    login: handleLogin, // WORKING
    register: handleRegister, // WORKING
    logout: handleLogout, // WORKING

    // Navigation
    navigate_home: handleNavigation, // WORKING
    navigate_about: handleNavigation, // WORKING
    navigate_contact: handleNavigation, // WORKING
    navigate_orders: handleNavigation, // WORKING
    navigate_dashboard: handleNavigation, // WORKING
    navigate_collection: handleNavigation, // WORKING
    navigate_wishlist: handleNavigation, // WORKING
    navigate_cart: handleNavigation, // WORKING

    // Search & Filters
    search_product: handleApplyFilter, // WORKING
    apply_filter: handleApplyFilter,  // WORKING
    reset_filter: handleReset,  // WORKING
    reset_sorting: handleReset,  // WORKING

    // Collection Page
    sort_by_price_low_to_high: handleSortByPriceLowToHigh, // WORKING
    sort_by_price_high_to_low: handleSortByPriceHighToLow, // WORKING
    open_particular_product: handleChooseParticularProduct, 

    // Product Actions
    add_to_cart: handleCart, // WORKING
    remove_from_cart: handleCart,  // WORKING
    add_to_wishlist: handleWishlist, // WORKING
    remove_from_wishlist: handleWishlist, // WORKING
    related_reviews:handleReviews,  // WORKING
    // Cart Actions
    remove_from_cart_in_cartPage: handleQuantityAndRemoveFromCartPage, // WORKING
    adjust_quantity: handleQuantityAndRemoveFromCartPage,  // WORKING
    ready_to_checkOut:readyToCheckOut,  // WORKING
    
    // Order Actions
    place_order: handlePlaceOrder, // WORKING
    change_shipping_address: handleChangeShippingAddress, // WORKING
    track_order: handleTrackOrder,  // WORKING
    cancel_order: handleCancelOrder, // WORKING
    review_order: handleReviewOrder, // WORKING

    // Profile Actions
    change_name: handleChangeName,  // WORKING
    change_phone_number: handleChangePhoneNumber,  // WORKING
    update_shipping_address: handleUpdateShippingAddress,   // WORKING

    // Contact Actions
    make_call: handleMakeCall,  // WORKING
    ask_question: handleAskDetails,
    read_the_content: handleReadTheContent, // WORKING

    stopSpeech:stopSpeech,  // WORKING
    select_size:selectSize, // WORKING
  };

  const handler = intentHandlers[finalResponse.intent];
  if (handler) {
    return handler(finalResponse, contextValues);
  }

  console.warn(`Unhandled intent: ${finalResponse.intent}`);
  textToSpeech("Sorry!, you intent not match with any our website interaction")
};