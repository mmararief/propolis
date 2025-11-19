import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { getUnitPriceForQuantitySync, fetchGlobalPriceTiers } from '../utils/pricing';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Fetch global price tiers on mount
  useEffect(() => {
    fetchGlobalPriceTiers().catch(err => console.error("Failed to fetch price tiers:", err));
  }, []);

  // Fetch cart from API when user logs in
  useEffect(() => {
    if (user) {
      api.get('/cart')
        .then(({ data }) => {
          // Map backend structure (jumlah) to frontend structure (qty)
          // Also keep the cart item ID for updates
          setItems(data.map(item => ({
            id: item.id,
            product: item.product,
            qty: item.jumlah
          })));
        })
        .catch(err => console.error("Failed to fetch cart:", err));
    } else {
      setItems([]); // Clear cart on logout or if not logged in
    }
  }, [user]);

  const addItem = async (product, qty = 1) => {
    // Optimistic update for immediate UI feedback (optional, but good UX)
    // For now, let's rely on the API response to ensure consistency
    if (user) {
      try {
        await api.post('/cart', { product_id: product.id, qty });
        // Refresh cart to get the correct IDs and merged quantities
        const { data } = await api.get('/cart');
        setItems(data.map(item => ({
          id: item.id,
          product: item.product,
          qty: item.jumlah
        })));
      } catch (err) {
        console.error("Failed to add item to cart:", err);
        alert("Gagal menyimpan ke keranjang. Silakan coba lagi.");
      }
    } else {
      // Fallback for guest (optional: implement localStorage here if needed)
      // For now, we just update local state but it won't persist on refresh
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, qty: item.qty + qty } : item,
          );
        }
        return [...prev, { product, qty }];
      });
    }
  };

  const updateQty = async (productId, qty) => {
    if (user) {
      const item = items.find(i => i.product.id === productId);
      if (!item) return;

      try {
        if (qty > 0) {
          await api.put(`/cart/${item.id}`, { qty });
        } else {
          await api.delete(`/cart/${item.id}`);
        }

        // Refresh or update local state
        const { data } = await api.get('/cart');
        setItems(data.map(item => ({
          id: item.id,
          product: item.product,
          qty: item.jumlah
        })));
      } catch (err) {
        console.error("Failed to update cart:", err);
      }
    } else {
      setItems((prev) =>
        prev
          .map((item) => (item.product.id === productId ? { ...item, qty } : item))
          .filter((item) => item.qty > 0),
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        setItems([]);
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    } else {
      setItems([]);
    }
  };

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const { unitPrice } = getUnitPriceForQuantitySync(item.product, item.qty);
        const price = unitPrice || item.product.harga_ecer || 250000;
        return sum + price * item.qty;
      }, 0),
    [items],
  );

  const totalWeight = useMemo(
    () => items.reduce((sum, item) => {
      const berat = item.product.berat || 500;
      return sum + item.qty * berat;
    }, 0),
    [items],
  );

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, clearCart, total, totalWeight }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

