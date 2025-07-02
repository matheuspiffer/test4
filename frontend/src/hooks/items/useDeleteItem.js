import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteItem } from "../../api/items";

/**
 * Hook for deleting items
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
} 