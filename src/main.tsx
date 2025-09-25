import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Today from "./pages/Today";
import Calendar from "./pages/Calendar";
import "./index.css";
import AuthProvider from "./auth/AuthProvider";
import ApolloProviderWithAuth from "./apollo/ApolloProviderWithAuth";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "today", element: <Today /> },    
      { path: "gardens", element: <Calendar /> },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ApolloProviderWithAuth>
             <RouterProvider router={router} />
      </ApolloProviderWithAuth>
    </AuthProvider>
  </React.StrictMode>
);
