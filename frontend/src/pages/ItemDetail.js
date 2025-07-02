import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ItemDetailCard } from "../components";
import { useGetItem } from "../hooks/items/useGetItem";

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    data: item, 
    isLoading: loading, 
    error 
  } = useGetItem(id);

  if (loading) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="loading">
            <p>Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="error">
            <p>Error loading item: {error.message}</p>
            <button 
              onClick={() => navigate('/')}
              className="primary-button"
            >
              Back to list
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !item) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="error">
            <p>Item not found</p>
            <button 
              onClick={() => navigate('/')}
              className="primary-button"
            >
              Back to list
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ItemDetailCard item={item} />;
}

export default ItemDetailPage;
