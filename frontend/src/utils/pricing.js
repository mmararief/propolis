export const getProductPriceTiers = (product = {}) => {
  const tiers = product.price_tiers ?? product.priceTiers ?? [];
  return [...tiers].sort((a, b) => (a.min_jumlah || 0) - (b.min_jumlah || 0));
};

export const getTierForQuantity = (product, qty) => {
  const tiers = getProductPriceTiers(product);
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

export const getUnitPriceForQuantity = (product, qty) => {
  const tier = getTierForQuantity(product, qty);
  const unitPrice = tier?.harga_total ?? product.harga_ecer ?? 0;
  return { tier, unitPrice };
};

