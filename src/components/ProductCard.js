import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React,{useEffect} from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
        component="img"
        height="300"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography component="p" fontWeight="bold">${product.cost}</Typography>
        <Rating name="product-rating" value={product.rating} readOnly />
      </CardContent>
      <CardActions>
        <Button fullWidth  variant="contained" color="primary" onClick={() => {handleAddToCart(product._id);}}>
        <AddShoppingCartOutlined /> Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
