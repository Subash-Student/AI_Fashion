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
  handleRemoveFromWishlist,
  handleMakeCall,
  handleReset
} from './intentHandler';

import axios from "axios";

export const extractInformation = async ( voiceInputText,contextValues) => {

  const {pageValues} = contextValues;

  const {currentPage} = pageValues;
  try {
    // 1. Find page config
    const pageConfig = arrayOfIntents.find((item) => item.page === currentPage);
    if (!pageConfig) {
      return { error: `No configuration found for page: ${currentPage}` };
    }

    const commonConfig = arrayOfIntents[0];
    
    const { intents, responseStructure } = pageConfig;

    // 2. Construct prompt for GPT
    const prompt = `
You are an AI assistant that extracts structured intent data from user voice commands. 
The current page is "${currentPage}". 

Here are the valid intents for this page:
${JSON.stringify(intents, null, 2)}

If not match with above intents then check this common page intents:
${JSON.stringify(commonConfig.intents, null, 2)}

If it match with common page intents then hear the expected response structure:
${JSON.stringify(commonConfig.responseStructure, null, 2)}


If not then Here is the expected response structure:
${JSON.stringify(responseStructure, null, 2)}

User said: "${voiceInputText}"

Based on this, return a JSON object that:
1. Selects the appropriate intent from the list.
2. Fills in the required fields in the response structure.
3. If any field cannot be determined, mark it as "unknown".

Return ONLY valid JSON and nothing else.
    `;

    // 3. Call OpenAI API
    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`, 
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

    // 5. Validate result fields
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

    handleIntent(finalResponse,contextValues)
     
  } catch (error) {
    console.error("Error in extractInformation:", error.message);
    return { error: "Something went wrong during intent extraction." };
  }
};




export const handleIntent = (finalResponse,  contextValues) => {
  switch (finalResponse.intent) {
      // Home Page Intents
      case "login":
          return handleLogin(finalResponse,  contextValues);
      case "register":
          return handleRegister(finalResponse,  contextValues);
      case "logout":
          return handleLogout(finalResponse,  contextValues);   // DONE
      case "navigate_home":
          return handleNavigation(finalResponse,  contextValues); // DONE
      case "navigate_about":
          return handleNavigation(finalResponse,  contextValues); // DONE
      case "navigate_contact":
          return handleNavigation(finalResponse,  contextValues); // DONE
      case "navigate_orders":
          return handleNavigation(finalResponse,  contextValues); // DONE
      case "navigate_dashboard":
          return handleNavigation(finalResponse,  contextValues); // DONE
      case "navigate_collection":
          return handleNavigation(finalResponse,  contextValues); // DONE
      case "navigate_wishlist":
          return handleNavigation(finalResponse,  contextValues); // DONE
      case "navigate_cart":
          return handleNavigation(finalResponse,  contextValues); // DONE
      case "search_product":
          return handleApplyFilter(finalResponse,  contextValues); // DONE
      case "apply_filter":
          return handleApplyFilter(finalResponse,  contextValues); // DONE

      // Collection Page Intents
      case "sort_by_price_low_to_high":
          return handleSortByPriceLowToHigh(finalResponse,  contextValues);  // DONE
      case "sort_by_price_high_to_low":
          return handleSortByPriceHighToLow(finalResponse,  contextValues); // DONE
      case "choose_particular_product":
          return handleChooseParticularProduct(finalResponse,  contextValues); // DONE
      case "ask_details":
          return handleAskDetails(finalResponse,  contextValues);
      case "reset_filter":
          return handleReset(finalResponse,  contextValues);  // DONE
      case "reset_sorting":
          return handleReset(finalResponse,  contextValues);  // DONE
    

      // Product Details Page Intents
      case "add_to_cart":
          return handleCart(finalResponse,  contextValues);   // DONE
      case "remove_from_cart":
          return handleCart(finalResponse,  contextValues);    // DONE
      case "add_to_wishlist":
          return handleWishlist(finalResponse,  contextValues);  // DONE
      case "remove_from_wishlist":
          return handleWishlist(finalResponse,  contextValues);  // DONE

      // Cart Page Intents
      case "remove_from_cart_in_cartPage":
          return handleQuantityAndRemoveFromCartPage(finalResponse,  contextValues);  // DONE
      case "adjust_quantity":
          return handleQuantityAndRemoveFromCartPage(finalResponse,  contextValues);   // DONE

      // Place Order Page Intents
      case "place_order":
          return handlePlaceOrder(finalResponse,  contextValues);    // DONE
      case "change_address":
          return handleChangeShippingAddress(finalResponse,  contextValues);  // DONE

      // Orders Page Intents
      case "track_order":
          return handleTrackOrder(finalResponse,  contextValues);  // DONE
      case "cancel_order":
          return handleCancelOrder(finalResponse,  contextValues);  // DONE
      case "review_order":
          return handleReviewOrder(finalResponse,  contextValues);  // DONE

      // Dashboard Page Intents
      case "change_name":
          return handleChangeName(finalResponse,  contextValues);
      case "change_phone_number":
          return handleChangePhoneNumber(finalResponse,  contextValues);
      case "update_shipping_address":
          return handleUpdateShippingAddress(finalResponse,  contextValues);
      case "read_the_content":
          return handleReadTheContent(finalResponse,  contextValues);
      case "remove_from_wishlist":
          return handleRemoveFromWishlist(finalResponse,  contextValues);

      // Contact Page Intents
      case "make_call":
          return handleMakeCall(finalResponse,  contextValues);

      // Fallback for unrecognized intents
      default:
          console.warn(`Unhandled intent: ${finalResponse.intent}`);
          return;
  }
};