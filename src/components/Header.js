import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack,TextField  } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import "./Header.css";
import { useHistory } from 'react-router-dom';
import { WindowSharp } from "@mui/icons-material";


const Header = ({ children, hasHiddenAuthButtons }) => {

  const history = useHistory();
  const [username,setUserName]= useState("");

  useEffect(() => {
    if(hasHiddenAuthButtons===true)
    {
      setUserName(localStorage.getItem('username'))
    }
  },[hasHiddenAuthButtons])

  
  const handleExplore = () => {
    history.push('/');
  };

  const handleLogin = () => {
    history.push('/login');
  };
  
  const handleRegister = () => {
    history.push('/register');
  };
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload()
  };

    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon" />
        </Box>
        { children }
        {(hasHiddenAuthButtons===null) && (
          <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="text"
            onClick={handleExplore}
          >Back to explore </Button>
        )}
        {(hasHiddenAuthButtons === false) && (
          <>
           <Stack className="right" direction="row" spacing ={1}>
            <Button variant="text" onClick={handleLogin}> Login </Button>
            <Button variant="contained" onClick={handleRegister}>Register</Button>
            </Stack>
          </>
        )}
        {(hasHiddenAuthButtons === true) && (
        <>
        <Stack className="right" direction="row" spacing ={1}>
          <Avatar src = "../../public/avatar.png" alt={username}/>
            <p className="username-text">{username}</p>
          <Button variant="text" onClick={handleLogout}> LOGOUT </Button>
        </Stack>
        </>
        )}

      </Box>
    );
};

export default Header;
