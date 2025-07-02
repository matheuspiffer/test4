import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import { Filters } from "../components";
import { useGetItems } from "../hooks/items/useGetItems";
import { useDeleteItem } from "../hooks/items/useDeleteItem";
import { CreateItemModal } from "./CreateItemModal";
import toast from "react-hot-toast";

// Row component for virtualized list
const ItemRow = ({ index, style, data }) => {
  const item = data.items[index];
  const { onEdit, onDelete, deleteItemMutation } = data;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onDelete(item.id, item.name);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(item);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action(e);
    }
  };

  return (
    <div style={style}>
      <article 
        className="item-wrapper"
        role="listitem"
        aria-labelledby={`item-name-${item.id}`}
        aria-describedby={`item-details-${item.id}`}
      >
        <div className="item-info">
          <Link 
            to={"/items/" + item.id} 
            className="item-link"
            aria-label={`View details for ${item.name}, priced at $${item.price}, category: ${item.category}`}
          >
            <h3 id={`item-name-${item.id}`} className="item-name">{item.name}</h3>
            <div id={`item-details-${item.id}`} className="item-details">
              <span className="item-category" aria-label={`Category: ${item.category}`}>
                {item.category}
              </span>
              <span className="item-price" aria-label={`Price: $${item.price}`}>
                ${item.price}
              </span>
            </div>
          </Link>
        </div>
        <div className="item-actions" role="group" aria-label={`Actions for ${item.name}`}>
          <button
            onClick={handleEdit}
            onKeyDown={(e) => handleKeyPress(e, handleEdit)}
            className="action-button edit-button"
            disabled={deleteItemMutation.isPending}
            title={`Edit ${item.name}`}
            aria-label={`Edit ${item.name}`}
            type="button"
          >
            <span aria-hidden="true">✏️</span>
            <span className="sr-only">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            onKeyDown={(e) => handleKeyPress(e, handleDelete)}
            className="action-button delete-button"
            disabled={deleteItemMutation.isPending}
            title={`Delete ${item.name}`}
            aria-label={`Delete ${item.name}`}
            type="button"
          >
            <span aria-hidden="true">🗑️</span>
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </article>
    </div>
  );
};

export function ItemsList() {
  // Filter states
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  // React Query hooks
  const {
    data: items = [],
    isLoading: loading,
    error,
  } = useGetItems({
    search,
    limit,
    page,
  });
  const deleteItemMutation = useDeleteItem();

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Filter handlers
  const handleSearchChange = useCallback((newSearch) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when search changes
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  // Item handlers
  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(
    (itemId, itemName) => {
      deleteItemMutation.mutate(itemId, {
        onSuccess: () => {
          toast.success(`Item "${itemName}" deleted successfully!`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete item");
        },
      });
    },
    [deleteItemMutation]
  );

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingItem(null);
  }, []);

  return (
    <div className="items-list-container">
      <section aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">Filter Items</h2>
        <div className="filters">
          <Filters
            search={search}
            limit={limit}
            onSearchChange={handleSearchChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </section>

      {/* Results info */}
      {!loading && items.length > 0 && (
        <div className="results-info" role="status" aria-live="polite">
          {search ? (
            <p>
              Found {items.length} item{items.length !== 1 ? "s" : ""} matching
              "{search}"
            </p>
          ) : (
            <p>
              Showing {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="loading" role="status" aria-live="polite">
          <p>Loading items...</p>
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          <p>Error: {error.message}</p>
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="no-items" role="status">
          <p>{search ? `No items found matching "${search}"` : "No items found"}</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <section aria-labelledby="items-list-heading">
          <h2 id="items-list-heading" className="sr-only">Items List Results</h2>
          <div 
            className="virtualized-list-container"
            role="list"
            aria-label={`List of ${items.length} items`}
          >
            <List
              height={
                window.innerWidth <= 640
                  ? Math.min(window.innerHeight - 280, 500)
                  : 600
              }
              itemCount={items.length}
              itemSize={window.innerWidth <= 640 ? 150 : 120}
              itemData={{
                items,
                onEdit: handleEdit,
                onDelete: handleDelete,
                deleteItemMutation,
              }}
              className="items-list"
            >
              {ItemRow}
            </List>
          </div>
        </section>
      )}

      {/* Edit Modal */}
      <CreateItemModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        item={editingItem}
      />
    </div>
  );
}
