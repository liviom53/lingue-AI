import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateId } from "@/lib/utils";

// Generic factory to create CRUD hooks targeting localStorage
// This replaces a backend API entirely for a frontend-only PWA
export function createLocalCrudHooks<T extends { id: string }>(key: string) {
  
  const getItems = (): T[] => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const useList = () => {
    return useQuery({
      queryKey: [key],
      queryFn: async () => {
        return getItems();
      },
    });
  };

  const useAdd = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (newItem: Omit<T, 'id'>) => {
        const items = getItems();
        const itemWithId = { ...newItem, id: generateId() } as T;
        localStorage.setItem(key, JSON.stringify([itemWithId, ...items]));
        return itemWithId;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    });
  };

  const useUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (updatedItem: T) => {
        const items = getItems();
        const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
        localStorage.setItem(key, JSON.stringify(newItems));
        return updatedItem;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    });
  };

  const useDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const items = getItems();
        const newItems = items.filter(i => i.id !== id);
        localStorage.setItem(key, JSON.stringify(newItems));
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    });
  };

  return { useList, useAdd, useUpdate, useDelete };
}

// Specific entity hooks
export const usciteAPI = createLocalCrudHooks<any>("diario_uscite");
export const pescatoAPI = createLocalCrudHooks<any>("diario_catture");
export const spotAPI = createLocalCrudHooks<any>("diario_spot");
export const attrezzaturaAPI = createLocalCrudHooks<any>("diario_attrezzatura");
