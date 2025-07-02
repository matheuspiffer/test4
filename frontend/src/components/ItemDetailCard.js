import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteItem } from "../hooks/items/useDeleteItem";
import { CreateItemModal } from "./CreateItemModal";
import toast from "react-hot-toast";

export function ItemDetailCard({ item }) {
  const navigate = useNavigate();
  const deleteItemMutation = useDeleteItem();
  const [showEditModal, setShowEditModal] = useState(false);
  const mainContentRef = useRef(null);

  // Focus management - focus main content when component loads
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, []);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id, {
        onSuccess: () => {
          toast.success(`Item "${item.name}" deleted successfully!`);
          navigate('/');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to delete item');
        }
      });
    }
  };

  const handleBackToList = () => {
    navigate('/');
  };

  const handleEditModalOpen = () => {
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
  };

  if (!item) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="error" role="alert">
            <p>Item not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="main-content">
        {/* Skip to main content for keyboard navigation */}
        <div className="sr-only">
          <a href="#item-details" className="skip-link">Skip to item details</a>
        </div>

        {/* Back button */}
        <nav role="navigation" aria-label="Breadcrumb">
          <button 
            onClick={handleBackToList}
            className="back-button"
            aria-label="Go back to items list"
            type="button"
          >
            <span aria-hidden="true">←</span> Back to list
          </button>
        </nav>

        {/* Main card with item details */}
        <main 
          id="item-details"
          ref={mainContentRef}
          className="item-detail-card"
          tabIndex="-1"
          role="main"
          aria-labelledby="item-title"
        >
          {/* Item header */}
          <header className="item-header">
            <h1 id="item-title" className="item-title">
              {item.name}
            </h1>
            <div 
              className="item-category-badge"
              role="img"
              aria-label={`Category: ${item.category}`}
            >
              {item.category}
            </div>
          </header>

          {/* Item information */}
          <section className="item-info-grid" aria-labelledby="item-info-heading">
            <h2 id="item-info-heading" className="sr-only">Item Information</h2>
            
            {/* Price */}
            <div className="price-section">
              <div className="price-label" id="price-label">
                Price
              </div>
              <div 
                className="price-value"
                role="img"
                aria-labelledby="price-label"
                aria-label={`Price is $${item.price}`}
              >
                ${item.price}
              </div>
            </div>

            {/* Item ID */}
            <div className="item-id-section">
              <span className="item-id-label" id="id-label">
                Item ID:
              </span>
              <span 
                className="item-id-value"
                aria-labelledby="id-label"
                role="text"
              >
                {item.id}
              </span>
            </div>
          </section>

          {/* Footer with additional actions */}
          <footer className="item-footer">
            <button
              onClick={handleBackToList}
              className="secondary-button"
              aria-label="Go back to items list"
              type="button"
            >
              <span aria-hidden="true">←</span> Back to list
            </button>
            <div className="item-actions" role="group" aria-label="Item actions">
              <button
                onClick={handleEditModalOpen}
                className="primary-button"
                disabled={deleteItemMutation.isPending}
                aria-label={`Edit ${item.name}`}
                type="button"
              >
                Edit Item
              </button>
              <button
                onClick={handleDelete}
                className="danger-button"
                disabled={deleteItemMutation.isPending}
                aria-label={`Delete ${item.name} - this action cannot be undone`}
                aria-describedby="delete-warning"
                type="button"
              >
                {deleteItemMutation.isPending ? 'Deleting...' : 'Delete Item'}
              </button>
              <div id="delete-warning" className="sr-only">
                Warning: This action will permanently delete the item and cannot be undone
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Edit Modal */}
      <CreateItemModal 
        isOpen={showEditModal} 
        onClose={handleEditModalClose}
        item={item}
      />
    </div>
  );
}

export default ItemDetailCard; 