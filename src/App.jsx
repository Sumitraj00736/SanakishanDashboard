import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext.jsx"; 
import Router from "./routes/Router.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Router />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
