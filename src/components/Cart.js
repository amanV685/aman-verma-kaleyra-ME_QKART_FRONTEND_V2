import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack,Grid,Item } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 * 
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */


// const item =
//   [
      //  {
      //      "name": "iPhone XR",
      //      "category": "Phones",
      //      "cost": 100,
      //      "rating": 4,
      //      "image": "https://i.imgur.com/lulqWzW.jpg",
      //      "_id": "v4sLtEcMpzabRyfx"
      //  },
//        // More such objects
//   ]

//   const cart =
//   [
//        {
//            "productId": "v4sLtEcMpzabRyfx",
//            "qty": 3
//        },
//        // More such objects
//   ]
  
export const generateCartItemsFrom = (cartData, productsData) => {

  const getProductById = productId => productsData.find(product => product._id === productId);

  const cartItems = cartData.map(item => {
    const product = getProductById(item.productId);
    if (product) {
        return {
            ...product,
            qty: item.qty
        };
    } else {
        return null; // Product not found
    }
}).filter(Boolean); // Remove null values

return cartItems;

};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items = []) => {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  let total = 0;
  for (const item of items) {
      // Assuming each item has a cost property
      total += parseInt(item.cost * item.qty);
  }

return total;


};


/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 * 
 * @param {Number} value
 *    Current quantity of product in cart
 * 
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 * 
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 * 
 * 
 */
const ItemQuantity = ({ value, handleAdd,handleDelete,}) => {
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

/**
 * Component to display the Cart view
 * 
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 * 
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 * 
 * @param {Function} handleQuantity
 *    Current quantity of product in cart
 * 
 * 
 */
const Cart = ({isReadOnly,products, items = [],handleQuantity}) => {

  const history = useHistory();
  

  const cartData_qty =  generateCartItemsFrom(items,products);

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      {!isReadOnly && (<Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        > 
           <div className="cart ">
            {cartData_qty.map(item => (
                
            <Box display="flex" key={item._id} alignItems="flex-start" padding="1rem">
                <Box className="image-container">
                    <img
                        // Add product image
                        src={item.image}
                        // Add product name as alt text
                        alt={item.name}
                        width="100%"
                        height="100%"
                    />
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="6rem"
                    paddingX="1rem"
                >
                    <div>{item.name}</div>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                    <ItemQuantity 
                    handleAdd={()=>{handleQuantity(item._id,item.qty+1)}}
                    handleDelete={()=>{handleQuantity(item._id,item.qty-1)}}
                    value={item.qty} 
                    />
                    <Box padding="0.5rem" fontWeight="700">
                        ${item.cost}
                    </Box>
                    </Box>
                </Box>
            </Box>
            ))}
        </div>
          
        </Box>
        <Box padding="1rem"
          display="flex"
          justifyContent="space-between">
        <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(cartData_qty)}
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" className="cart-footer">
          <Button
            color="primary"
            variant="contained"
            startIcon={<ShoppingCart />}
            className="checkout-btn"
            onClick ={() => history.push('/checkout')}
          >
            Checkout
          </Button>
        </Box>
      </Box>)}

      {isReadOnly && cartData_qty.length> 0 && (
        <>
        <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        > 
           <div className="cart ">
            {cartData_qty.map(item => (
                
            <Box display="flex" key={item._id} alignItems="flex-start" padding="1rem">
                <Box className="image-container">
                    <img
                        // Add product image
                        src={item.image}
                        // Add product name as alt text
                        alt={item.name}
                        width="100%"
                        height="100%"
                    />
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="6rem"
                    paddingX="1rem"
                >
                    <div>{item.name}</div>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                    <p>Qty:{item.qty}</p>
                    <Box padding="0.5rem" fontWeight="700">
                        ${item.cost}
                    </Box>
                    </Box>
                </Box>
            </Box>
            ))}
        </div>
          
        </Box>
        
      </Box>
      <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <h3><b>Order Details</b></h3>   
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center">
          <Box padding="0.5rem" fontWeight="700">Products</Box>
          <Box padding="0.5rem" fontWeight="700">{cartData_qty.length}</Box>
          </Box>
          <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center">
          <Box padding="0.5rem" fontWeight="700">Subtotal</Box>
          <Box padding="0.5rem" fontWeight="700">${getTotalCartValue(cartData_qty)}</Box>
          </Box>
          <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center">
          <Box padding="0.5rem" fontWeight="700">Shipping Charges</Box>
          <Box padding="0.5rem" fontWeight="700">0</Box>
          </Box>
          <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center">
          <Box padding="0.5rem" fontWeight="700">Total</Box>
          <Box padding="0.5rem" fontWeight="700">${getTotalCartValue(cartData_qty)}</Box>
          </Box>
      </Box>
        </>
      
      )}
    </>
  );
};

export default Cart;
