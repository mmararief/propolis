import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected item IDs

  // Fetch cart from API when user logs in
  useEffect(() => {
    if (user) {
      api.get('/cart')
        .then(({ data }) => {
          // Map backend structure (jumlah) to frontend structure (qty)
          // Include variant and pack information
          const mappedItems = data.map(item => ({
            id: item.id,
            product: item.product,
            product_variant: item.product_variant || null,
            product_variant_pack: item.product_variant_pack || null,
            qty: parseInt(item.jumlah, 10) || 0
          }));
          setItems(mappedItems);
          // Auto-select all items on load
          setSelectedItems(new Set(mappedItems.map(item => item.id)));
        })
        .catch(err => console.error("Failed to fetch cart:", err));
    } else {
      setItems([]); // Clear cart on logout or if not logged in
      setSelectedItems(new Set());
    }
  }, [user]);

  // Selection functions
  const toggleSelect = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(items.map(item => item.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;

  const addItem = async (product, qty = 1, variantId = null, packId = null) => {
    // Optimistic update for immediate UI feedback (optional, but good UX)
    // For now, let's rely on the API response to ensure consistency
    if (user) {
      try {
        const payload = {
          product_id: product.id,
          product_variant_id: variantId || null,
          product_variant_pack_id: packId || null,
          qty,
        };
        await api.post('/cart', payload);
        // Refresh cart to get the correct IDs and merged quantities
        const { data } = await api.get('/cart');
        const mappedItems = data.map(item => ({
          id: item.id,
          product: item.product,
          product_variant: item.product_variant || null,
          product_variant_pack: item.product_variant_pack || null,
          qty: parseInt(item.jumlah, 10) || 0,
        }));
        setItems(mappedItems);
        // Auto-select newly added item
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          mappedItems.forEach(item => newSet.add(item.id));
          return newSet;
        });
      } catch (err) {
        console.error("Failed to add item to cart:", err);
        alert("Gagal menyimpan ke keranjang. Silakan coba lagi.");
      }
    } else {
      // Fallback for guest (optional: implement localStorage here if needed)
      // For now, we just update local state but it won't persist on refresh
      return new Promise((resolve) => {
        setItems((prev) => {
          // Check if same product, variant, and pack already exists
          const existing = prev.find((item) =>
            item.product.id === product.id &&
            (item.product_variant?.id || null) === (variantId || null) &&
            (item.product_variant_pack?.id || null) === (packId || null)
          );
          if (existing) {
            return prev.map((item) =>
              item.product.id === product.id &&
                (item.product_variant?.id || null) === (variantId || null) &&
                (item.product_variant_pack?.id || null) === (packId || null)
                ? { ...item, qty: item.qty + qty }
                : item,
            );
          }
          return [...prev, { product, qty, product_variant: variantId ? { id: variantId } : null, product_variant_pack: packId ? { id: packId } : null }];
        });
        resolve();
      });
    }
  };

  const updateQty = async (cartItemId, qty) => {
    if (user) {
      const item = items.find(i => i.id === cartItemId);
      if (!item) return;

      try {
        if (qty > 0) {
          await api.put(`/cart/${cartItemId}`, { qty });
        } else {
          await api.delete(`/cart/${cartItemId}`);
          // Remove from selected if deleted
          setSelectedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(cartItemId);
            return newSet;
          });
        }

        // Refresh or update local state
        const { data } = await api.get('/cart');
        setItems(data.map(item => ({
          id: item.id,
          product: item.product,
          product_variant: item.product_variant || null,
          product_variant_pack: item.product_variant_pack || null,
          qty: parseInt(item.jumlah, 10) || 0,
        })));
      } catch (err) {
        console.error("Failed to update cart:", err);
      }
    } else {
      setItems((prev) =>
        prev
          .map((item) => (item.id === cartItemId ? { ...item, qty } : item))
          .filter((item) => item.qty > 0),
      );
    }
  };

  const removeItem = async (itemId) => {
    if (user) {
      try {
        await api.delete(`/cart/${itemId}`);
        // Remove from selected
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        // Refresh cart
        const { data } = await api.get('/cart');
        setItems(data.map(item => ({
          id: item.id,
          product: item.product,
          product_variant: item.product_variant || null,
          product_variant_pack: item.product_variant_pack || null,
          qty: parseInt(item.jumlah, 10) || 0,
        })));
      } catch (err) {
        console.error("Failed to remove item from cart:", err);
        alert("Gagal menghapus item dari keranjang. Silakan coba lagi.");
      }
    } else {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        setItems([]);
        setSelectedItems(new Set());
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    } else {
      setItems([]);
      setSelectedItems(new Set());
    }
  };

  // Get only selected items for checkout
  const getSelectedItems = () => items.filter(item => selectedItems.has(item.id));

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        // Calculate total: pack harga × jumlah paket
        if (item.product_variant_pack?.harga_pack) {
          const packSize = item.product_variant_pack.pack_size || 1;
          const packPrice = item.product_variant_pack.harga_pack;
          const numPacks = Math.floor(item.qty / packSize); // Jumlah paket
          return sum + (packPrice * numPacks);
        } else if (item.product_variant?.harga_ecer) {
          return sum + (item.product_variant.harga_ecer * item.qty);
        } else {
          return sum + ((item.product?.harga_ecer || 250000) * item.qty);
        }
      }, 0),
    [items],
  );

  // Total for selected items only
  const selectedTotal = useMemo(
    () =>
      items.filter(item => selectedItems.has(item.id)).reduce((sum, item) => {
        if (item.product_variant_pack?.harga_pack) {
          const packSize = item.product_variant_pack.pack_size || 1;
          const packPrice = item.product_variant_pack.harga_pack;
          const numPacks = Math.floor(item.qty / packSize);
          return sum + (packPrice * numPacks);
        } else if (item.product_variant?.harga_ecer) {
          return sum + (item.product_variant.harga_ecer * item.qty);
        } else {
          return sum + ((item.product?.harga_ecer || 250000) * item.qty);
        }
      }, 0),
    [items, selectedItems],
  );

  const totalWeight = useMemo(
    () => items.reduce((sum, item) => {
      const berat = item.product?.berat || 500;
      return sum + item.qty * berat;
    }, 0),
    [items],
  );

  // Weight for selected items only
  const selectedWeight = useMemo(
    () => items.filter(item => selectedItems.has(item.id)).reduce((sum, item) => {
      const berat = item.product?.berat || 500;
      return sum + item.qty * berat;
    }, 0),
    [items, selectedItems],
  );

  // Count of selected items
  const selectedCount = useMemo(
    () => items.filter(item => selectedItems.has(item.id)).reduce((sum, item) => sum + item.qty, 0),
    [items, selectedItems],
  );

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      updateQty,
      removeItem,
      clearCart,
      total,
      totalWeight,
      // Selection features
      selectedItems,
      toggleSelect,
      selectAll,
      clearSelection,
      isAllSelected,
      getSelectedItems,
      selectedTotal,
      selectedWeight,
      selectedCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

