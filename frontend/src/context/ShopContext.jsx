import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { textToSpeech } from "../utils/voiceContent";


export const ShopContext = createContext();

const ShopContextProvider = (props) => {


    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const [user,setUser] = useState({});
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState([]);
    const[isLoading,setIsLoading] = useState(false);
    const [showPincodeModal, setShowPincodeModal] = useState(false);

  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [material, setMaterial] = useState([]);
  const [returnable, setReturnable] = useState(null);
  const [inStock, setInStock] = useState(null);
  const [sortType, setSortType] = useState('relavent');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showModal, setShowModal] = useState(false);
  
  const [filterProducts, setFilterProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  const [pageValues,setPageValues] = useState({
    currentPage:"",
    values:{}
  })
  const [size, setSize] = useState('')

  const [cartData, setCartData] = useState([]);
  const [showMic, setShowMic] = useState(false);


  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(4);
  const [reviewProductId, setReviewProductId] = useState(null);

  const statusSteps = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  const handleTrackOrder = (status) => {
    setSelectedStatus(status);
    setShowStatusModal(true);
  };

  const handleCancelOrder = (item) => {
    setSelectedItem(item);
    setShowCancelModal(true);
    setCancelReason('');
  };

   const handleOpenReview = (productId) => {
    setReviewProductId(productId);
    setReviewText('');
    setReviewRating(4);
    setShowReviewModal(true);
  };



  const loadOrderData = async () => {
    try {
      if (!token) return;
      setIsLoading(true)
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, {
        headers: { token }
      });
      setIsLoading(false)
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            item['orderId'] = order._id;
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);


    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error('Select Product Size');
            textToSpeech('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
      setIsLoading(true)
               
                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } })
                setIsLoading(false)
              return true
            } catch (error) {
                console.log(error)
                toast.error(error.message)
                textToSpeech(error.message)
                return false
            }
        }

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {

        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;

        setCartItems(cartData)

        if (token) {
            try {
                setIsLoading(true)

                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } })
                setIsLoading(false)

            } catch (error) {
                console.log(error)
                toast.error(error.message)
                textToSpeech(error.message)
            }
        }

    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            setIsLoading(true)

            const response = await axios.get(backendUrl + '/api/product/list')
      setIsLoading(false)

            if (response.data.success) {
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message)
                textToSpeech(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            textToSpeech(error.message)
        }
    }

    const getUserData = async (token) => {
        try {
         
            if(token){
      setIsLoading(true)

                const response = await axios.get(backendUrl + '/api/user/myData',{
                    headers:{token}
                })
      setIsLoading(false)

                if (response.data.success) {
                    setUser(response.data.user)
                } else {
                    toast.error(response.data.message)
                    textToSpeech(response.data.message)
                }
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            textToSpeech(error.message)
        }
    }

    const getUserCart = async ( token ) => {
        try {
      setIsLoading(true)
            
            const response = await axios.post(backendUrl + '/api/cart/get',{},{headers:{token}})
      setIsLoading(false)

            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            textToSpeech(error.message)
        }
    }
    
    
    useEffect(() => {
        getProductsData()
        
    }, [])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }
        if (token) {
            getUserCart(token)
            getUserData(token)
        }
    }, [token])

    const resetFilters = () => {
        setSearch("")
        setShowSearch(false);
        setCategory([]);
        setSubCategory([]);
        setMaterial([]);
        setReturnable(null);
        setInStock(null);
        setSortType('relavent');
        setPriceRange([0, 5000]);
      };


      const toggleWishlist = async (productId) => {
        try {
          const token = localStorage.getItem('token')
          const url = `http://localhost:4000/api/product/wishlist/${isWishlisted ? 'remove' : 'add'}`
          const res = await axios.post(url, { productId }, { headers: { token } })
    
          if (res.data.success) {
            setIsWishlisted(!isWishlisted)
          }
        } catch (error) {
          console.error('Wishlist toggle error:', error)
        }
      }



      const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token, orderData,
        user, getUserData,
        loadOrderData,
        isLoading, setIsLoading,
        category, setCategory,
        subCategory, setSubCategory,
        material, setMaterial,
        returnable, setReturnable,
        inStock, setInStock,
        sortType, setSortType,
        priceRange, setPriceRange,
        filterProducts, setFilterProducts,
        resetFilters, pageValues, setPageValues,
        size, setSize,
        isWishlisted, setIsWishlisted, toggleWishlist,
        cartData, setCartData,
        showPincodeModal, setShowPincodeModal,showModal,setShowModal,
      
        // NEWLY ADDED:
        showStatusModal, setShowStatusModal,
        selectedStatus, setSelectedStatus,
        showCancelModal, setShowCancelModal,
        cancelReason, setCancelReason,
        selectedItem, setSelectedItem,
      
        showReviewModal, setShowReviewModal,
        reviewText, setReviewText,
        reviewRating, setReviewRating,
        reviewProductId, setReviewProductId,
      
        handleTrackOrder,
        handleCancelOrder,
        handleOpenReview,
        statusSteps,

        showMic, setShowMic
      };
      

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;