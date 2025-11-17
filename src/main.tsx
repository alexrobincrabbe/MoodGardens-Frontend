import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apollo/client";
import App from "./App";
import "./index.css";
import {Home, Today, Calendar, Account} from "./pages";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "today", element: <Today /> },
      { path: "gardens", element: <Calendar /> },
       { path: "account", element: <Account /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>

      <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);
