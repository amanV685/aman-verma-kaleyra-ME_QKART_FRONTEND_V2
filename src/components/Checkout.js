import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

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
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

// TODO: CRIO_TASK_MODULE_CHECKOUT - Should allow to type a new address in the text field and add the new address or cancel adding new address
/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 *    Login token
 *
 * @param { NewAddress } newAddress
 *    Data on new address being added
 *
 * @param { Function } handleNewAddress
 *    Handler function to set the new address field to the latest typed value
 *
 * @param { Function } addAddress
 *    Handler function to make an API call to add the new address
 *
 * @returns { JSX.Element }
 *    JSX for the Add new address view
 *
 */


const AddNewAddressView = ({setAddNewButtonClick,token,newAddress,handleNewAddress,addAddress}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        value={newAddress.value}
        placeholder="Enter your complete address"
        onChange={(event) => {
          handleNewAddress({
            value: event.target.value,
            isAddingNewAddress: true,
          });
          
        }}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => {
            addAddress(token,newAddress);
          }}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={()=>{
            console.log("Cancel button pressed");
            setAddNewButtonClick(true);
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {


  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addNewButtonClick,setAddNewButtonClick]=useState(true);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  const [totlaCartValue,setCartValue]= useState(0);
  const [addressId,setSelectedAddressId]=useState("");


  const getTotalCartValue = (items = []) => {
    console.log(items);
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
  

  
  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Fetch list of addresses for a user
   *
   * API Endpoint - "GET /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data)
      setAddresses({ ...addresses, all: response.data,selected:"" });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Handler function to add a new address and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { NewAddress } newAddress
   *    Data on new address being added
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "POST /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const addAddress = async (token, newAddress) => {
    if (!token) return;
    const payloadData = newAddress.value;
    try {
      const response = await axios.post(`${config.endpoint}/user/addresses`,{address:payloadData}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses({all:response.data,selected:newAddress.value}) ;
      setNewAddress({value:"",isAddingNewAddress:false});
      return response.data;

    }catch (e) {
      if (e.response) {
        // console.log(e.response)
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  /**
   * Handler function to delete an address from the backend and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { String } addressId
   *    Id value of the address to be deleted
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "DELETE /user/addresses/:addressId"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const deleteAddress = async (token, addressId) => {
    if (!token) return;
    try {
      const response = await axios.delete(`${config.endpoint}/user/addresses/${addressId}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses({all:response.data,selected:""});      
      return response.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Validate request for checkout
  /**
   * Return if the request validation passed. If it fails, display appropriate warning message.
   *
   * Validation checks - show warning message with given text if any of these validation fails
   *
   *  1. Not enough balance available to checkout cart items
   *    "You do not have enough balance in your wallet for this purchase"
   *
   *  2. No addresses added for user
   *    "Please add a new address before proceeding."
   *
   *  3. No address selected for checkout
   *    "Please select one shipping address to proceed."
   *
   * @param { Array.<CartItem> } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    Whether validation passed or not
   *
   */
  const validateRequest = (items, addresses) => {
      if(totlaCartValue>localStorage.getItem("balance"))
      { enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        {
          variant: "warning",
        }
      );
      return false;
    }
    else if (addresses.selected==="")
    {
      enqueueSnackbar(
      "Please select one shipping address to proceed.",
      {
        variant: "warning",
      }
    );
    return false;
    }
    else if(addresses.all.length===0)
    {
      enqueueSnackbar(
        "Please add a new address before proceeding.",
        {
          variant: "warning",
        }
      ); 
      return false;
    }
    return true;
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT
  /**
   * Handler function to perform checkout operation for items added to the cart for the selected address
   *
   * @param { String } token
   *    Login token
   *
   * @param { Array.<CartItem } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    If checkout operation was successful
   *
   * API endpoint - "POST /cart/checkout"
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *  "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *  "success": false,
   *  "message": "Wallet balance not sufficient to place order"
   * }
   *
   */
  const performCheckout = async (token, items, addresses) => {
    if (validateRequest(items,addresses)===true)
    {
        if (!token) return false;

      try {
        const response = await axios.post(`${config.endpoint}/cart/checkout`,{addressId:addressId}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem('balance',`${localStorage.getItem("balance")}`-totlaCartValue);
        history.push('/thanks');
        enqueueSnackbar(
          "Order placed successfully",
          {
            variant: "success",
          }
        );

      }catch (e) {
        if (e.response) {
          // console.log(e.response)
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
      }

    }
    return false;

  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Fetch addressses if logged in, otherwise show info message and redirect to Products page
  const setSelectedAddress = (allAddress,currentSelectedAddress,addressId) => {
        setSelectedAddressId(addressId)
        setAddresses({all:allAddress.all,selected:currentSelectedAddress});
  };
  
  // Fetch products and cart data on page load
  useEffect(() => {

    if(!token)
    {
      enqueueSnackbar(
        "You must be logged in to access checkout page",
        {
          variant: "message",
        }
      );
      history.push('/');
      
    } 
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
                
        setItems(cartData);
        const allCartData = generateCartItemsFrom(cartData,productsData);
        const totalCartAllaData =getTotalCartValue(allCartData);
        setCartValue(totalCartAllaData);
      }
    };
    onLoadHandler();
    getAddresses(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header hasHiddenAuthButtons={true} />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}
              {addresses.all.length <=0 && 
              <Typography my="1rem">
                 No addresses found for this account. Please add one to proceed
              </Typography>}
              {addresses.all.length >=0 &&
              (
                <>
                  {addresses.all.map((address) => (
                    
                      <Box onClick={() => 
                        setSelectedAddress(addresses,address.address,address._id)}
                        key={address._id} display="flex" className={`address-item ${address.address===addresses.selected?'selected':'not-selected'}`} >
                          <Box>
                            <Typography color="#3C3C3C" variant="h6" my="1rem">
                            {address.address}
                            </Typography>
                          </Box>
                         <Button
                          startIcon={<Delete />}
                          variant="text"
                          onClick={()=>{
                            deleteAddress(token,address._id)
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                  ))}

                </>

              ) }
            </Box>

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
            {addNewButtonClick && <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setAddNewButtonClick(false)
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
            </Button>}
            
            {!addNewButtonClick  && <AddNewAddressView
                setAddNewButtonClick={setAddNewButtonClick}
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
            />}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${totlaCartValue} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={()=>{
                performCheckout(token,items,addresses)
              }}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly={true} products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
