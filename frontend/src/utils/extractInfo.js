import { arrayOfIntents } from "./intentMap";
import {
  handleLogin,
  handleRegister,
  handleLogout,
  handleNavigation,
  handleSearchProduct,
  handleApplyFilter,
  handleSortByPriceLowToHigh,
  handleSortByPriceHighToLow,
  handleSortByBestSeller,
  handleAskDetails,
  handleChooseParticularProduct,
  handleAddToCart,
  handleAddToWishlist,
  handleRemoveFromCart,
  handleViewCart,
  handlePlaceOrder,
  handleSelectPaymentMethod,
  handleChangeShippingAddress,
  handleTrackOrder,
  handleCancelOrder,
  handleReviewOrder,
  handleChangeName,
  handleChangePhoneNumber,
  handleUpdateShippingAddress,
  handleReadTheContent,
  handleRemoveFromWishlist,
  handleMakeCall
} from './intentHandler';

import axios from "axios";

export const extractInformation = async (pageValues, voiceInputText,contextValues) => {

  const {currentPage} = pageValues;
  try {
    // 1. Find page config
    const pageConfig = arrayOfIntents.find((item) => item.page === currentPage);
    if (!pageConfig) {
      return { error: `No configuration found for page: ${currentPage}` };
    }

    const { intents, responseStructure } = pageConfig;

    // 2. Construct prompt for GPT
    const prompt = `
You are an AI assistant that extracts structured intent data from user voice commands. 
The current page is "${currentPage}". 

Here are the valid intents for this page:
${JSON.stringify(intents, null, 2)}

Here is the expected response structure:
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

    handleIntent(finalResponse,pageValues,contextValues)
     
  } catch (error) {
    console.error("Error in extractInformation:", error.message);
    return { error: "Something went wrong during intent extraction." };
  }
};




export const handleIntent = (finalResponse, pageValues, contextValues) => {
  switch (finalResponse.intent) {
      // Home Page Intents
      case "login":
          return handleLogin(finalResponse, pageValues, contextValues);
      case "register":
          return handleRegister(finalResponse, pageValues, contextValues);
      case "logout":
          return handleLogout(finalResponse, pageValues, contextValues);   //done
      case "navigate_home":
          return handleNavigation(finalResponse, pageValues, contextValues); //done
      case "navigate_about":
          return handleNavigation(finalResponse, pageValues, contextValues); //done
      case "navigate_contact":
          return handleNavigation(finalResponse, pageValues, contextValues); //done
      case "navigate_orders":
          return handleNavigation(finalResponse, pageValues, contextValues); //done
      case "navigate_dashboard":
          return handleNavigation(finalResponse, pageValues, contextValues); //done
      case "navigate_collection":
          return handleNavigation(finalResponse, pageValues, contextValues); //done
      case "navigate_wishlist":
          return handleNavigation(finalResponse, pageValues, contextValues); //done
      case "navigate_cart":
          return handleNavigation(finalResponse, pageValues, contextValues); //done
      case "search_product":
          return handleApplyFilter(finalResponse, pageValues, contextValues); //done
      case "apply_filter":
          return handleApplyFilter(finalResponse, pageValues, contextValues); //done

      // Collection Page Intents
      case "sort_by_price_low_to_high":
          return handleSortByPriceLowToHigh(finalResponse, pageValues, contextValues);
      case "sort_by_price_high_to_low":
          return handleSortByPriceHighToLow(finalResponse, pageValues, contextValues);
      case "choose_particular_product":
          return handleChooseParticularProduct(finalResponse, pageValues, contextValues);
      case "ask_details":
          return handleAskDetails(finalResponse, pageValues, contextValues);
      case "choose_particular_product":
          return handleChooseProduct(finalResponse, pageValues, contextValues);

      // Product Details Page Intents
      case "add_to_cart":
          return handleAddToCart(finalResponse, pageValues, contextValues);
      case "add_to_wishlist":
          return handleAddToWishlist(finalResponse, pageValues, contextValues);

      // Cart Page Intents
      case "remove_from_cart":
          return handleRemoveFromCart(finalResponse, pageValues, contextValues);
      case "view_cart":
          return handleViewCart(finalResponse, pageValues, contextValues);

      // Place Order Page Intents
      case "place_order":
          return handlePlaceOrder(finalResponse, pageValues, contextValues);
      case "select_payment_method":
          return handleSelectPaymentMethod(finalResponse, pageValues, contextValues);
      case "change_shipping_address":
          return handleChangeShippingAddress(finalResponse, pageValues, contextValues);

      // Orders Page Intents
      case "track_order":
          return handleTrackOrder(finalResponse, pageValues, contextValues);
      case "cancel_order":
          return handleCancelOrder(finalResponse, pageValues, contextValues);
      case "review_order":
          return handleReviewOrder(finalResponse, pageValues, contextValues);

      // Dashboard Page Intents
      case "change_name":
          return handleChangeName(finalResponse, pageValues, contextValues);
      case "change_phone_number":
          return handleChangePhoneNumber(finalResponse, pageValues, contextValues);
      case "update_shipping_address":
          return handleUpdateShippingAddress(finalResponse, pageValues, contextValues);
      case "read_the_content":
          return handleReadTheContent(finalResponse, pageValues, contextValues);
      case "remove_from_wishlist":
          return handleRemoveFromWishlist(finalResponse, pageValues, contextValues);

      // Contact Page Intents
      case "make_call":
          return handleMakeCall(finalResponse, pageValues, contextValues);

      // Fallback for unrecognized intents
      default:
          console.warn(`Unhandled intent: ${finalResponse.intent}`);
          return;
  }
};