import PropTypes from 'prop-types';
import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Navigate} from "react-router-dom"


const ProtectRoute = ({ children }) => {
    const { user } = useContext(ShopContext);

    return user && user.cartData && Object.keys(user.cartData).length > 0 
        ? children 
        : <Navigate to={"/"} />;
};


export default ProtectRoute