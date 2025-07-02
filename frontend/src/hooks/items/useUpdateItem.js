import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateItem } from "../../api/items";

/**
 * Hook for updating items
 */
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateItem(id, data),
    onSuccess: (_, { id }) => {
      // Normalize ID to string to ensure cache invalidation works correctly
      const normalizedId = id.toString();
      
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["item", normalizedId] });
      
      // Also invalidate with the original ID format just in case
      if (normalizedId !== id) {
        queryClient.invalidateQueries({ queryKey: ["item", id] });
      }
    },
  });
}
