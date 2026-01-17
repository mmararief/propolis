import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../utils/imageHelper';
import { FaTrash } from 'react-icons/fa';

const CartPage = () => {
  const {
    items,
    updateQty,
    removeItem,
    clearCart,
    selectedItems,
    toggleSelect,
    selectAll,
    clearSelection,
    isAllSelected,
    selectedTotal,
    selectedCount
  } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleQuantityChange = (cartItemId, newQty) => {
    if (newQty > 0) {
      updateQty(cartItemId, newQty);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.size > 0) {
      navigate('/checkout');
    } else {
      alert('Pilih minimal satu produk untuk checkout');
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  return (
    <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
      <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4 sm:mb-8 flex-wrap">
          <Link
            to="/"
            className="font-ui font-normal text-xs sm:text-[16px] text-black hover:opacity-70 transition-colors"
          >
            Beranda
          </Link>
          <span className="font-ui font-normal text-xs sm:text-[16px] text-black"> &gt; </span>
          <span
            className="font-ui font-normal text-xs sm:text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Keranjang
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-ui font-bold text-2xl sm:text-3xl lg:text-[48px] mb-8 uppercase text-center lg:text-left"
          style={{ color: '#D2001A' }}
        >
          KERANJANG BELANJA
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-slate-600 text-lg mb-4">Keranjang kamu masih kosong. Yuk pilih produk favoritmu!</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 rounded-lg text-white font-ui font-semibold text-[16px] hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#D2001A' }}
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items Table */}
            <div className="grow">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Table Header - Desktop Only */}
                <div
                  className="hidden lg:grid grid-cols-12 text-white p-4"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 w-5 h-5 cursor-pointer"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      title="Pilih Semua"
                    />
                  </div>
                  <div className="col-span-4 font-ui font-semibold">Produk</div>
                  <div className="col-span-2 text-center font-ui font-semibold">Harga</div>
                  <div className="col-span-2 text-center font-ui font-semibold">Kuantitas</div>
                  <div className="col-span-2 text-center font-ui font-semibold">Total Harga</div>
                  <div className="col-span-1 text-center font-ui font-semibold">Aksi</div>
                </div>

                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 text-white" style={{ backgroundColor: '#D2001A' }}>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 w-5 h-5 cursor-pointer"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      title="Pilih Semua"
                    />
                    <span className="font-ui font-semibold">Pilih Semua</span>
                  </div>
                  <span className="text-sm font-ui">
                    {selectedItems.size} dari {items.length} dipilih
                  </span>
                </div>

                {/* Cart Items */}
                {items.map((item) => {
                  // Calculate price per pack and pack info
                  let packPrice = 0;
                  let packSize = 1;
                  let packQuantity = item.qty; // Default to qty if no pack

                  if (item.product_variant_pack?.harga_pack) {
                    packSize = item.product_variant_pack.pack_size || 1;
                    packPrice = item.product_variant_pack.harga_pack;
                    packQuantity = Math.floor(item.qty / packSize); // Jumlah paket
                  } else if (item.product_variant?.harga_ecer) {
                    packPrice = item.product_variant.harga_ecer;
                    packSize = 1;
                    packQuantity = item.qty;
                  } else {
                    packPrice = item.product?.harga_ecer || 250000;
                    packSize = 1;
                    packQuantity = item.qty;
                  }

                  const variantLabel = item.product_variant?.tipe || '';
                  const packLabel = item.product_variant_pack?.label || '';
                  const totalPrice = packPrice * packQuantity; // Harga paket × jumlah paket
                  const isSelected = selectedItems.has(item.id);

                  // Handler untuk update quantity (update dalam satuan paket)
                  const handlePackQuantityChange = (delta) => {
                    const newPackQty = packQuantity + delta;
                    if (newPackQty >= 1) {
                      // Kirim jumlah botol total ke backend
                      const newQty = newPackQty * packSize;
                      handleQuantityChange(item.id, newQty);
                    }
                  };

                  return (
                    <>
                      {/* Desktop Layout */}
                      <div
                        key={`${item.id || item.product.id}-${item.product_variant?.id || ''}-${item.product_variant_pack?.id || ''}`}
                        className={`hidden lg:grid grid-cols-12 border-b p-4 items-center transition-colors ${isSelected ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 w-5 h-5 cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                          />
                        </div>
                        <div className="col-span-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-[#f1f1f1] rounded flex items-center justify-center overflow-hidden relative">
                              {item.product?.gambar ? (
                                <img
                                  src={getProductImageUrl(item.product.gambar)}
                                  alt={item.product.nama_produk}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <span className={`text-xs text-slate-400 ${item.product?.gambar ? 'hidden' : ''}`}>Gambar</span>
                            </div>
                            <div>
                              <h3 className="font-ui font-medium text-gray-900 mb-1">
                                {item.product?.nama_produk || 'Produk'}
                              </h3>
                              {(variantLabel || packLabel) && (
                                <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                                  {variantLabel && (
                                    <p>
                                      <span className="font-semibold">Varian:</span> {variantLabel}
                                    </p>
                                  )}
                                  {packLabel && (
                                    <p>
                                      <span className="font-semibold">Paket:</span> {packLabel}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-center font-ui text-gray-900">
                          {formatPrice(packPrice)}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handlePackQuantityChange(-1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-ui font-bold text-gray-700"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={packQuantity}
                              readOnly
                              className="w-12 text-center border rounded font-ui font-semibold"
                            />
                            <button
                              onClick={() => handlePackQuantityChange(1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-ui font-bold text-gray-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div
                          className="col-span-2 text-center font-ui font-medium"
                          style={{ color: '#D2001A' }}
                        >
                          {formatPrice(totalPrice)}
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus produk ini dari keranjang?')) {
                                removeItem(item.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded hover:bg-red-50"
                            title="Hapus produk"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div
                        key={`mobile-${item.id || item.product.id}-${item.product_variant?.id || ''}-${item.product_variant_pack?.id || ''}`}
                        className={`lg:hidden border-b p-4 transition-colors ${isSelected ? 'bg-red-50' : 'bg-white'}`}
                      >
                        <div className="flex gap-3 mb-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 w-5 h-5 cursor-pointer mt-1"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                          />
                          <div className="flex-1">
                            <div className="flex gap-3">
                              <div className="w-20 h-20 bg-[#f1f1f1] rounded flex items-center justify-center overflow-hidden relative flex-shrink-0">
                                {item.product?.gambar ? (
                                  <img
                                    src={getProductImageUrl(item.product.gambar)}
                                    alt={item.product.nama_produk}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <span className={`text-xs text-slate-400 ${item.product?.gambar ? 'hidden' : ''}`}>Gambar</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-ui font-medium text-gray-900 mb-1 text-sm">
                                  {item.product?.nama_produk || 'Produk'}
                                </h3>
                                {(variantLabel || packLabel) && (
                                  <div className="text-xs text-slate-600 space-y-0.5">
                                    {variantLabel && (
                                      <p>
                                        <span className="font-semibold">Varian:</span> {variantLabel}
                                      </p>
                                    )}
                                    {packLabel && (
                                      <p>
                                        <span className="font-semibold">Paket:</span> {packLabel}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Harga Satuan</p>
                            <p className="font-ui text-gray-900 text-sm">{formatPrice(packPrice)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Total Harga</p>
                            <p className="font-ui font-medium text-sm" style={{ color: '#D2001A' }}>
                              {formatPrice(totalPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePackQuantityChange(-1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-ui font-bold text-gray-700"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={packQuantity}
                              readOnly
                              className="w-12 text-center border rounded font-ui font-semibold text-sm"
                            />
                            <button
                              onClick={() => handlePackQuantityChange(1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-ui font-bold text-gray-700"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus produk ini dari keranjang?')) {
                                removeItem(item.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded hover:bg-red-50"
                            title="Hapus produk"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })}

                {/* Delete All Button */}
                <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <button
                    onClick={clearCart}
                    className="font-ui font-medium hover:underline transition-colors text-sm sm:text-base"
                    style={{ color: '#D2001A' }}
                  >
                    Hapus Semua Produk
                  </button>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {selectedItems.size} dari {items.length} produk dipilih
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-80 w-full">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-[120px]">
                <h2 className="text-base sm:text-lg font-ui font-semibold mb-4 text-gray-900">
                  Ringkasan Pesanan
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between font-ui text-gray-700">
                    <span>Produk Dipilih</span>
                    <span>{selectedCount} item</span>
                  </div>
                  <div className="flex justify-between font-ui text-gray-700">
                    <span>Perkiraan Total Harga</span>
                    <span>{formatPrice(selectedTotal)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div
                    className="flex justify-between font-ui font-semibold"
                    style={{ color: '#D2001A' }}
                  >
                    <span>Total</span>
                    <span>{formatPrice(selectedTotal)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={selectedItems.size === 0}
                    className="w-full py-3 rounded-lg font-ui font-semibold text-sm sm:text-[16px] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#D2001A' }}
                  >
                    Checkout ({selectedItems.size})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

