import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (!get().isInWishlist(item.id)) {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) });
      },
      toggleItem: (item) => {
        if (get().isInWishlist(item.id)) {
          get().removeItem(item.id);
        } else {
          get().addItem(item);
        }
      },
      isInWishlist: (id) => {
        return get().items.some(item => item.id === id);
      },
    }),
    {
      name: 'silk-haus-wishlist-storage',
    }
  )
);
