import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createItem } from "../../api/items";

/**
 * Custom hook for creating items using React Query mutation
 * Follows standardized mutation pattern with automatic query invalidation
 * 
 * @returns {Object} Mutation object with mutate function and state
 */
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      // Invalidate all items queries
      queryClient.invalidateQueries({ queryKey: ['items'] });
      // Invalidate stats to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
