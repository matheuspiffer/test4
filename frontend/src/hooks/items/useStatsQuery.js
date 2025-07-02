import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "../../api/stats";

/**
 * Custom hook for fetching stats using React Query
 * Follows standardized query pattern
 * 
 * @param {Object} params - Query parameters
 * @param {boolean} params.enabled - Whether query should be enabled (default: true)
 * @returns {Object} Query result with data, loading, error, and refetch function
 */
export function useGetStats({
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
    refetchOnWindowFocus: false,
  });
}

// Backward compatibility export
export function useStatsQuery() {
  return useGetStats();
}

export default useGetStats; 