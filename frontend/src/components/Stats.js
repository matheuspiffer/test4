import React from "react";
import toast from "react-hot-toast";
import { useStatsQuery } from "../hooks/items/useStatsQuery";

export function Stats() {
  const { data: stats, isLoading: loading, error, refetch } = useStatsQuery();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Stats refreshed successfully!");
    } catch (err) {
      toast.error("Failed to refresh stats");
    }
  };

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" role="alert">
        <p>Error loading statistics: {error.message}</p>
        <button 
          onClick={handleRefresh} 
          className="primary-button" 
          style={{ marginTop: '1rem' }}
          aria-label="Retry loading statistics"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="error" role="status">
        <p>No statistics data available</p>
      </div>
    );
  }

  return (
    <section className="stats-container" aria-labelledby="stats-title">
      <header className="stats-header">
        <h2 id="stats-title">Statistics</h2>
      </header>
      <div className="stats-grid" role="group" aria-labelledby="stats-title">
        <div className="stat-card" role="img" aria-labelledby="total-items-label total-items-value">
          <div id="total-items-label" className="stat-label">Total Items</div>
          <div id="total-items-value" className="stat-value" aria-label={`${stats.total.toLocaleString()} total items`}>
            {stats.total.toLocaleString()}
          </div>
        </div>
        <div className="stat-card" role="img" aria-labelledby="avg-price-label avg-price-value">
          <div id="avg-price-label" className="stat-label">Average Price</div>
          <div id="avg-price-value" className="stat-value" aria-label={`Average price is $${stats.averagePrice.toFixed(2)}`}>
            ${stats.averagePrice.toFixed(2)}
          </div>
        </div>
      </div>
      <footer className="stats-footer">
        <button 
          onClick={handleRefresh} 
          className="primary-button"
          aria-label="Refresh statistics data"
          type="button"
        >
          Refresh Stats
        </button>
      </footer>
    </section>
  );
}