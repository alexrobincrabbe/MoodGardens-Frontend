import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { apollo } from "./lib/apollo";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Today from "./pages/Today";
import Gardens from "./pages/Gardens";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "today", element: <Today /> },
      { path: "gardens", element: <Gardens /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={apollo}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);
