import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: {
    length?: string;
    color?: string;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (id: string, variantKey?: string) => void;
  updateQuantity: (id: string, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

// Helper to generate a unique key for items with variants
const getVariantKey = (item: CartItem) => {
  if (!item.variant) return item.id;
  return `${item.id}-${item.variant.length || 'default'}-${item.variant.color || 'default'}`;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const currentItems = get().items;
        const newKey = getVariantKey(newItem);
        
        const existingItemIndex = currentItems.findIndex(item => getVariantKey(item) === newKey);

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },
      removeItem: (id, variantKey) => {
        set((state) => ({
          items: state.items.filter(item => {
            if (variantKey) return getVariantKey(item) !== variantKey;
            return item.id !== id;
          })
        }));
      },
      updateQuantity: (id, quantity, variantKey) => {
        set((state) => ({
          items: state.items.map(item => {
            const matches = variantKey ? getVariantKey(item) === variantKey : item.id === id;
            if (matches) return { ...item, quantity };
            return item;
          })
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'silk-haus-cart-storage-v2',
    }
  )
);
