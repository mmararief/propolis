import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../utils/imageHelper';
import { FaTrash } from 'react-icons/fa';

const CartPage = () => {
  const { items, updateQty, removeItem, clearCart, total } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleQuantityChange = (productId, delta) => {
    const item = items.find((item) => item.product.id === productId);
    if (item) {
      const newQty = item.qty + delta;
      if (newQty > 0) {
        updateQty(productId, newQty);
      }
    }
  };

  const handleCheckout = () => {
    if (items.length > 0) {
      navigate('/checkout');
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const estimatedTotal = total;

  return (
    <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
      <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/"
            className="font-ui font-normal text-[16px] text-black hover:opacity-70 transition-colors"
          >
            Beranda
          </Link>
          <span className="font-ui font-normal text-[16px] text-black"> &gt; </span>
          <span
            className="font-ui font-normal text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Keranjang
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-ui font-bold text-[48px] mb-8 uppercase"
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
                {/* Table Header */}
                <div
                  className="grid grid-cols-12 text-white p-4"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  <div className="col-span-1">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </div>
                  <div className="col-span-4 font-ui font-semibold">Produk</div>
                  <div className="col-span-2 text-center font-ui font-semibold">Harga</div>
                  <div className="col-span-2 text-center font-ui font-semibold">Kuantitas</div>
                  <div className="col-span-2 text-center font-ui font-semibold">Total Harga</div>
                  <div className="col-span-1 text-center font-ui font-semibold">Aksi</div>
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

                  // Handler untuk update quantity (update dalam satuan paket)
                  const handlePackQuantityChange = (delta) => {
                    const newPackQty = packQuantity + delta;
                    if (newPackQty >= 1) {
                      // Kirim jumlah botol total ke backend
                      const newQty = newPackQty * packSize;
                      handleQuantityChange(item.product.id, newQty - item.qty);
                    }
                  };

                  return (
                  <div
                    key={`${item.id || item.product.id}-${item.product_variant?.id || ''}-${item.product_variant_pack?.id || ''}`}
                    className="grid grid-cols-12 border-b p-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-1">
                      <input type="checkbox" className="rounded border-gray-300" />
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
                );})}

                {/* Delete All Button */}
                <div className="p-4 border-t">
                  <button
                    onClick={clearCart}
                    className="font-ui font-medium hover:underline transition-colors"
                    style={{ color: '#D2001A' }}
                  >
                    Hapus Semua Produk
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-[120px]">
                <h2 className="text-lg font-ui font-semibold mb-4 text-gray-900">
                  Ringkasan Pesanan
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between font-ui text-gray-700">
                    <span>Jumlah Produk</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between font-ui text-gray-700">
                    <span>Perkiraan Total Harga</span>
                    <span>{formatPrice(estimatedTotal || total)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div
                    className="flex justify-between font-ui font-semibold"
                    style={{ color: '#D2001A' }}
                  >
                    <span>Total</span>
                    <span>{formatPrice(estimatedTotal || total)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-lg font-ui font-semibold text-[16px] text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#D2001A' }}
                  >
                    Checkout
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
