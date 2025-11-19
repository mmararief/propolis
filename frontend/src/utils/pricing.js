import api from '../api/client';

let globalPriceTiersCache = null;
let globalPriceTiersLoading = null;

/**
 * Fetch global price tiers from API
 */
export const fetchGlobalPriceTiers = async () => {
  if (globalPriceTiersCache) {
    return globalPriceTiersCache;
  }
  
  if (globalPriceTiersLoading) {
    return globalPriceTiersLoading;
  }

  globalPriceTiersLoading = api.get('/price-tiers')
    .then(({ data }) => {
      const tiers = data.data ?? data ?? [];
      globalPriceTiersCache = [...tiers].sort((a, b) => (a.min_jumlah || 0) - (b.min_jumlah || 0));
      globalPriceTiersLoading = null;
      return globalPriceTiersCache;
    })
    .catch((err) => {
      globalPriceTiersLoading = null;
      console.error('Failed to fetch global price tiers:', err);
      return [];
    });

  return globalPriceTiersLoading;
};

/**
 * Clear global price tiers cache
 */
export const clearPriceTiersCache = () => {
  globalPriceTiersCache = null;
  globalPriceTiersLoading = null;
};

/**
 * Get global price tiers (sync version - uses cache)
 * Returns empty array if not yet loaded
 */
export const getProductPriceTiersSync = () => {
  return globalPriceTiersCache || [];
};

/**
 * Get global price tiers for a product (all products use the same global tiers)
 * Async version - fetches if not cached
 */
export const getProductPriceTiers = async () => {
  const tiers = await fetchGlobalPriceTiers();
  return tiers;
};

/**
 * Get tier for a specific quantity from global price tiers (sync version)
 */
export const getTierForQuantitySync = (product, qty) => {
  const tiers = getProductPriceTiersSync();
  return (
    tiers
      .slice()
      .reverse()
      .find(
        (tier) =>
          qty >= (tier.min_jumlah || 0) &&
          (!tier.max_jumlah || qty <= tier.max_jumlah),
      ) || null
  );
};

/**
 * Get tier for a specific quantity from global price tiers (async version)
 */
export const getTierForQuantity = async (product, qty) => {
  const tiers = await fetchGlobalPriceTiers();
  return (
    tiers
      .slice()
      .reverse()
      .find(
        (tier) =>
          qty >= (tier.min_jumlah || 0) &&
          (!tier.max_jumlah || qty <= tier.max_jumlah),
      ) || null
  );
};

/**
 * Get unit price for a specific quantity (sync version)
 * harga_total adalah total harga untuk min_jumlah item
 * Jadi harga per item = harga_total / min_jumlah
 */
export const getUnitPriceForQuantitySync = (product, qty) => {
  const tier = getTierForQuantitySync(product, qty);
  let unitPrice;
  
  if (tier && tier.harga_total && tier.min_jumlah) {
    // harga_total adalah total untuk min_jumlah item, jadi harga per item = harga_total / min_jumlah
    unitPrice = tier.harga_total / tier.min_jumlah;
  } else {
    unitPrice = product.harga_ecer ?? 250000;
  }
  
  return { tier, unitPrice };
};

/**
 * Get unit price for a specific quantity (async version)
 * harga_total adalah total harga untuk min_jumlah item
 * Jadi harga per item = harga_total / min_jumlah
 */
export const getUnitPriceForQuantity = async (product, qty) => {
  const tier = await getTierForQuantity(product, qty);
  let unitPrice;
  
  if (tier && tier.harga_total && tier.min_jumlah) {
    // harga_total adalah total untuk min_jumlah item, jadi harga per item = harga_total / min_jumlah
    unitPrice = tier.harga_total / tier.min_jumlah;
  } else {
    unitPrice = product.harga_ecer ?? 250000;
  }
  
  return { tier, unitPrice };
};
