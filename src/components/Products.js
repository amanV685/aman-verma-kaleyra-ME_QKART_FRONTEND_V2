import { Search, SentimentDissatisfied, ShoppingCartIcon } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Cart from "./Cart";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [token, setToken] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    getItemFromStorage();
    performAPICall();

  }, []);

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
     * Perform the API call to fetch the user's cart and return the response
     *
     * @param {string} token - Authentication token returned on login
     *
     * @returns { Array.<{ productId: string, qty: number }> | null }
     *    The response JSON object
     *
     * Example for successful response from backend:
     * HTTP 200
     * [
     *      {
     *          "productId": "KCRwjF7lN97HnEaY",
     *          "qty": 3
     *      },
     *      {
     *          "productId": "BW0jAAeDJmlZCF8i",
     *          "qty": 1
     *      }
     * ]
     *
     * Example for failed response from backend:
     * HTTP 401
     * {
     *      "success": false,
     *      "message": "Protected route, Oauth2 Bearer token not found"
     * }
     */

  const fetchCart = async (token) => {

    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      await axios.get(`${config.endpoint}/cart`, { headers }).
        then(response => {

          setCartItems(response.data);

        })
    } catch (e) {
      if (e.response && e.response.status === 404) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {

        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  const handleAddToCart =  (productId) => {
     addToCart(token, cartItems, productList, productId, 1, { preventDuplicate: true });
  };


  const handleCartDataQty = async (productId, qty) => {
    await addToCart(token, cartItems, productList, productId, qty, { preventDuplicate: false });
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */



  const isItemInCart = (items, productId) => {

    for (const item of items) {
      // Check if current item's productId matches the provided productId
      if (item.productId === productId) {
        // If a matching productId is found, return true
        return true;
      }
    }
    // If no matching productId is found, return false
    return false;

  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */



  const addToCart = async (token, items, products, productId, qty, options = { preventDuplicate: false }) => {
    if (!token)
      return enqueueSnackbar("Login to add an item to the Cart", { variant: "warning" });

    if (options.preventDuplicate === true) {
      if (isItemInCart(items, productId)) {
        enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: "warning" });
        return;
      }
    }


    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Adjust content type if needed
    };

    const requestData = {
      productId: productId,
      qty: qty
    }

    await axios.post(`${config.endpoint}/cart`, requestData, { headers }).then
      (response => {
        // console.log(response.data);
        setCartItems(response.data);

        return cartItems;
      }).catch(error => {
        console.log(error);
      })



  };


  let debounceId = null;

  const debounceSearch = (event, debounceTimeout) => {
    clearTimeout(debounceId);
    debounceId = setTimeout(performSearch, 500, event.target.value)
  }

  const performAPICall = async () => {
    try {
      // Make a GET request to the backend API to fetch the product list
      const response = await axios.get(`${config.endpoint}/products`);
      if (response.status === 200) {
        setProductList(response.data)
      }
      // Return the data (product list) from the response
      // return response.data;
      setLoading(false);

    } catch (error) {
      // Handle any errors that occur during the API request
      setLoading(false);
      console.error(error.message);
      throw new Error('Failed to fetch product list');

    }
  };

  async function getItemFromStorage() {
    try {
      // Retrieve the item from AsyncStorage
      const value = localStorage.getItem('token');
      // const username = localStorage.getItem('username');

      if (value !== null) {
        await fetchCart(value);
        setToken(value);
        setIsLoggedIn(true);

      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {

      console.error('Error retrieving data from AsyncStorage:', error);
      return null;
    }
  }

  const performSearch = async (searchValue) => {
    // Make a GET request to the backend API to fetch the product list
    await axios.get(`${config.endpoint}/products/search?value=${searchValue}`)
      .then(response => {
        const data = response.data;
        setProductList(data);

      }).catch(error => {
        if (error.response.status === 404) {
          setProductList([]);
          setLoading(false);
          console.log(error.message);
        }
      }

      )
  };

  return (
    <div>
      <Header hasHiddenAuthButtons={isLoggedIn}>
        <Box className="search">
          <TextField
            className="searchsearch-desktop"
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            onChange={(e) => debounceSearch(e, debounceId)}
            name="search"
          />
        </Box>
      </Header>
      <Grid container >
        <Grid item md={isLoggedIn ? 9 : 12} className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
          {loading === true && (
            <div>
              <CircularProgress className="loading" />
              <p>Loading Products</p>
            </div>
          )}
          {
            loading === false && (
              <div>
                <Grid container className="product-grid" p={2} spacing={2}>
                  {
                    productList.length ? (productList.map((product) => (
                      <Grid item key={product._id} xs={6} md={3}>
                        <ProductCard product={product} handleAddToCart={handleAddToCart} />
                      </Grid>
                    ))) :
                      (
                        <div className="no-products">
                          <SentimentDissatisfied />
                          No Products Found
                        </div>
                      )}
                </Grid>

              </div>
            )
          }
        </Grid>
        {isLoggedIn && (
          <Grid style={{ backgroundColor: "#E9F5E1" }} item md={3} xs={12}>
            <Cart products={productList} items={cartItems} handleQuantity={handleCartDataQty} />
          </Grid>
        )}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
