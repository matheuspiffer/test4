import { useQuery } from "@tanstack/react-query";
import { listItems, getItem } from "../../api/items";

/**
 * Custom hook for fetching items using React Query
 * Follows standardized query pattern with pagination and filtering
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query (default: '')
 * @param {boolean} params.enabled - Whether query should be enabled (default: true)
 * @returns {Object} Query results
 */
export function useGetItems({
  page = 1,
  limit = 10,
  search = "",
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ["items", page, limit, search],
    queryFn: () => listItems({ q: search, limit, page }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

export default useGetItems;
