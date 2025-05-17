export const arrayOfIntents = [
    {
      page: "common",
      intents: [
        "login",
        "register",
        "logout",
        "stopSpeech",
        "navigate_home",
        "navigate_about",
        "navigate_contact",
        "navigate_orders",
        "navigate_dashboard",
        "navigate_collection",
        "navigate_wishlist",
        "navigate_nextPage",
        "navigate_priviousPage",
        "navigate_cart",
        "search_product",
        "apply_filter",
        "read_the_content",
        "ask_question",
        "make_call",


      ],
      responseStructure: {
        intent: "",
        user: {
          email: "",
          password: "",
          name: ""
        },
        navigation: {
          currentPage: "",
          to: ""
        },
        searchItemName:"",

        filters: {
          category:"",
          subCategory:"",
          material:"",
          returnable:false,
          inStock:false,
          priceRange:[0, 5000],
          
        }
      }
    },
    {
      page: "collection",
      intents: [
        "search_product",
        "apply_filter",
        "sort_by_price_low_to_high",
        "sort_by_price_high_to_low",
        "reset_filter",
        "reset_sorting",
        "ask_question",
        "open_particular_product"
      ],
      responseStructure: {
        intent: "",
        
          searchItemName:"",
        filters: {
          category:"'Men', 'Women', 'Kids'",
          subCategory:"'Topwear', 'Bottomwear', 'Winterwear'",
          material:"'Cotton', 'Wool', 'Polyester'",
          returnable:"true || null",
          inStock:"true || null",
          priceRange:[0, 5000],
          
        },
        sort: {
          sortBy: ""
        },
        
        question :""

      }
    },
    {
      page: "ProductDetails",
      intents: [
        "ask_question",
        "add_to_cart",
        "add_to_wishlist",
        "remove_from_cart",
        "remove_from_wishlist",
        "related_reviews",
        "select_size",
      ],
      responseStructure: {
        intent: "",
        question :"",
        size:"S || M || L || XL || XXL",
        reviewAction:"read_best_reviews || read_bad_reviews || read_all_reviews",
        userAction: {
          cart: "add || remove",
          wishlist: "add || remove"
        },
      }
    },
    {
      page: "cart",
      intents: [
        "remove_from_cart_in_cartPage",
        "ask_question",
        "adjust_quantity",
        "ready_to_checkOut"
      ],
      responseStructure: {
        intent: "",
        action:"remove || adjust_quantity",
        adjust_quantity: "increment || decrement",
        product_number_for_action:"1,2,3,4,5,...",
        // productName:"",
        quantity:"1,2,3,4,5,...",
        question :""
      }
    },
    {
      page: "placeOrder",
      intents: [
        "ask_question",
        "place_order",
        "change_shipping_address",
      ],
      responseStructure: {
        intent: "",
        question :""
      }
    },
    {
      page: "orders",
      intents: [
        "track_order",
        "cancel_order",
        "review_order",
        "ask_question",
      ],
      responseStructure: {
        intent: "",
        productName:"",
        question :""
  
      }
    },
    {
      page: "dashboard",
      intents: [
        "ask_question",
        "change_name",
        "change_phone_number",
        "update_shipping_address",
        "remove_from_wishlist",
      ],
      responseStructure: {
        intent: "",
        answer:"",
        user: {
          name: "",
          phoneNumber: "",
          pincode:"",
          question :""
        }
      }
    },
    {
      page: "about",
      intents: [
        "ask_question",
        "read_the_content"
      ],
      responseStructure: {
        intent: "",
        answer:"",
        question :""
      }
    },
    {
      page: "contact",
      intents: [
        "ask_question",
        "make_call",
        "read_the_content"
      ],
      responseStructure: {
        intent: "",
        makeCall: true,
        question :""
      }
    }
  ];
  