import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Items from "./Items";
import ItemDetail from "./ItemDetail";
import { Toaster } from "react-hot-toast";
import "../App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Skip Links for accessibility */}
      <div className="skip-links">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
      </div>

      <header role="banner">
        <nav 
          id="navigation" 
          className="nav" 
          role="navigation" 
          aria-label="Main navigation"
        >
          <div className="container">
            <Link 
              to="/" 
              aria-label="Go to items list - Home page"
              className="nav-link"
            >
              Items
            </Link>
          </div>
        </nav>
      </header>

      <main 
        id="main-content" 
        className="main-content" 
        role="main"
        tabIndex="-1"
      >
        <div className="container">
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
          </Routes>
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#059669",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#dc2626",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
