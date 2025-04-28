export const arrayOfIntents = [
    {
      page: "common",
      intents: [
        "login",
        "register",
        "logout",
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
        "sort_by_best_seller",
        "ask_question",
        "choose_particular_product"
      ],
      responseStructure: {
        intent: "",
        search: {
          query: ""
        },
        filters: {
          categories: [],
          priceRange: {
            min: 0,
            max: 0
          },
          ratings: 0
        },
        sort: {
          sortBy: ""
        },
        product: {
          id: "",
          name: ""
        }
      }
    },
    {
      page: "ProductDetails",
      intents: [
        "ask_question",
        "add_to_cart",
        "add_to_wishlist"
      ],
      responseStructure: {
        intent: "",
        product: {
          id: "",
          name: "",
          detailsRequested: true
        },
        userAction: {
          addToCart: false,
          addToWishlist: false
        }
      }
    },
    {
      page: "cart",
      intents: [
        "remove_from_cart",
        "ask_question",
        "view_cart",
      ],
      responseStructure: {
        intent: "",
        cart: {
          items: [
            {
              productId: "",
              quantity: 1
            }
          ]
        },
        action: {
          viewCart: true,
          removeItemId: ""
        }
      }
    },
    {
      page: "placeOrder",
      intents: [
        "ask_question",
        "place_order",
        "select_payment_method",
        "change_shipping_address",
      ],
      responseStructure: {
        intent: "",
        placeOrder:false || true,
        shipping: {
          selectedAddressId: "",
          newAddress: {
            street: "",
            city: "",
            pincode: "",
            country: ""
          }
        },
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
        answer:"",
        order: {
          orderId: "",
          productId: "",
          reason: "",
        },
        review: {
          productId:"",
          rating: 0,
          review: ""
        }
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
          wishlist: [
            {
              productId: "",
            }
          ]
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
        answer:""
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
        answer:""
      }
    }
  ];
  