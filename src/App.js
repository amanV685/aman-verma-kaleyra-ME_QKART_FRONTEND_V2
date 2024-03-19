import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import Login from "./components/Login";
import { ThemeProvider } from "@mui/material";
import theme from "./theme"
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";

export const config = {
  endpoint: `http://${ipConfig.workspaceIp}/api/v1`,
};

function App() {
  return (
    <ThemeProvider theme={theme}>
    <Router>
      <div className="App">
        <Switch >
        <Route exact path="/">
            <Products/>
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/checkout">
            <Checkout />
          </Route>
          <Route path="/thanks">
            <Thanks />
          </Route>
        </Switch>
      </div>
    </Router>
  </ThemeProvider>
  );
}

export default App;
