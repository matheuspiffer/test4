import { useQuery } from "@tanstack/react-query";
import { getItem } from "../../api/items";

/**
 * Custom hook for fetching a single item by ID using React Query
 * Follows standardized query pattern with caching and error handling
 *
 * @param {number|string} id - Item ID to fetch
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether query should be enabled (default: true when id is provided)
 * @returns {Object} Query results including data, loading state, error, etc.
 * 
 * @example
 * // Basic usage
 * const { data: item, isLoading, error } = useGetItem(itemId);
 * 
 * @example
 * // Conditional fetching (only fetch when ID is available)
 * const { data: item, isLoading } = useGetItem(itemId, { enabled: !!itemId });
 * 
 * @example
 * // With all return values
 * const { 
 *   data: item, 
 *   isLoading, 
 *   error, 
 *   refetch,
 *   isFetching 
 * } = useGetItem(itemId);
 */
export function useGetItem(id, { enabled = true } = {}) {
  // Normalize ID to string to ensure consistent cache keys
  const normalizedId = id ? id.toString() : id;
  
  return useQuery({
    queryKey: ["item", normalizedId],
    queryFn: () => getItem(normalizedId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!normalizedId, // Only enable if ID is provided and enabled is true
  });
}

export default useGetItem; 