import React, { useState, useEffect, useCallback } from "react";
import useDebounce from "../hooks/useDebounce";

export function Filters({ search = "", limit = 10, onSearchChange, onLimitChange }) {
  const [localSearch, setLocalSearch] = useState(search);

  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, search, onSearchChange]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleInputChange = useCallback((e) => {
    setLocalSearch(e.target.value);
  }, []);

  const handleSelectChange = useCallback((e) => {
    onLimitChange(parseInt(e.target.value));
  }, [onLimitChange]);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className="filters" role="search" aria-label="Filter items">
      <div className="filters-container">
        <div className="search-field">
          <label htmlFor="search">Search Items:</label>
          <div className="search-input-container">
            <input
              id="search"
              type="text"
              placeholder="Type to search items..."
              value={localSearch}
              onChange={handleInputChange}
              aria-describedby="search-help"
              autoComplete="off"
            />
            {localSearch && (
              <button
                type="button"
                className="clear-search-button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                title="Clear search"
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
          <div id="search-help" className="sr-only">
            Search will filter items by name and category as you type
          </div>
        </div>

        <div className="limit-field">
          <label htmlFor="limit">Items per page:</label>
          <select
            id="limit"
            value={limit}
            onChange={handleSelectChange}
            aria-describedby="limit-help"
          >
            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((num) => (
              <option key={num} value={num}>
                {num} items
              </option>
            ))}
          </select>
          <div id="limit-help" className="sr-only">
            Choose how many items to display per page
          </div>
        </div>
      </div>
    </div>
  );
}
