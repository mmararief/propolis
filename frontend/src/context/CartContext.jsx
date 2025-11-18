import { createContext, useContext, useMemo, useState } from 'react';
import { getUnitPriceForQuantity } from '../utils/pricing';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [...prev, { product, qty }];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      prev
        .map((item) => (item.product.id === productId ? { ...item, qty } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const { unitPrice } = getUnitPriceForQuantity(item.product, item.qty);
        const price = unitPrice || item.product.harga_ecer || 0;
        return sum + price * item.qty;
      }, 0),
    [items],
  );

  const totalWeight = useMemo(
    () => items.reduce((sum, item) => {
      const berat = item.product.berat || 500; // Gunakan berat dari produk, default 500g jika tidak ada
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

