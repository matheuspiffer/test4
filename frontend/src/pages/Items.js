import React, { useState } from "react";
import { ItemsList, Stats, CreateItemModal } from "../components";

function Items() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateItemClick = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div className="items-page">
      <section aria-labelledby="stats-heading">
        <h1 id="stats-heading" className="sr-only">Statistics Overview</h1>
        <Stats />
      </section>
      
      <section aria-labelledby="items-heading">
        <header className="items-header">
          <h1 id="items-heading">Items List</h1>
          <button 
            className="primary-button create-item-button"
            onClick={handleCreateItemClick}
            aria-describedby="create-item-description"
          >
            + Create New Item
          </button>
          <div id="create-item-description" className="sr-only">
            Opens a modal dialog to create a new item
          </div>
        </header>
        
        <ItemsList />
      </section>
      
      <CreateItemModal 
        isOpen={showCreateModal} 
        onClose={handleCloseModal}
        aria-label={showCreateModal ? "Create new item dialog" : undefined}
      />
    </div>
  );
}

export default Items;
