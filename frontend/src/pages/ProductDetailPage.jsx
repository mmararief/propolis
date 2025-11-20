import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import cartIcon from '../assets/images/shopping-cart0.png';
import { SkeletonText, SkeletonButton, SkeletonProductCard } from '../components/Skeleton';
import { getProductImageUrl } from '../utils/imageHelper';
import { getProductPriceTiers, fetchGlobalPriceTiers } from '../utils/pricing';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [priceTiers, setPriceTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addItem, clearCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [productResponse, tiers] = await Promise.all([
          api.get(`/products/${id}`),
          fetchGlobalPriceTiers()
        ]);
        setProduct(productResponse.data.data);
        setPriceTiers(tiers || []);
        
        // Fetch related products
        try {
          const { data: relatedData } = await api.get('/products');
          const allProducts = relatedData.data?.data ?? relatedData.data ?? [];
          const filtered = allProducts.filter((p) => p.id !== parseInt(id)).slice(0, 4);
          setRelatedProducts(filtered);
        } catch (err) {
          console.error('Failed to fetch related products:', err);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const getAvailableStock = () => {
    if (!product) return 0;
    if (typeof product.stok_available === 'number') return Math.max(0, product.stok_available);
    return Math.max(0, (product.stok || 0) - (product.stok_reserved || 0));
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const available = getAvailableStock();
    if (newQuantity >= 1 && newQuantity <= available) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      try {
        // Clear cart first for "Buy Now" behavior
        await clearCart();
        // Add the selected product
        await addItem(product, quantity);
        // Navigate to checkout
        navigate('/checkout');
      } catch (err) {
        console.error('Failed to process buy now:', err);
        // Fallback: just add to cart and navigate
        addItem(product, quantity);
        navigate('/checkout');
      }
    }
  };

  if (loading) {
    return (
      <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
        <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
          {/* Breadcrumbs Skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>

          {/* Product Detail Skeleton */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
            {/* Image Skeleton */}
            <div className="w-full lg:w-1/2">
              <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Info Skeleton */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-12 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="mb-16 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <SkeletonText lines={3} />
          </div>

          {/* Related Products Skeleton */}
          <div className="mb-16">
            <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-8 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonProductCard key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
        <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const available = getAvailableStock();
  const price = product.harga_ecer;
  const images = Array.isArray(product.gambar) ? product.gambar : (product.gambar ? [product.gambar] : []);
  const currentImage = images[selectedImageIndex] || null;

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
          <Link
            to="/products"
            className="font-ui font-normal text-[16px] text-black hover:opacity-70 transition-colors"
          >
            Produk
          </Link>
          <span className="font-ui font-normal text-[16px] text-black"> &gt; </span>
          <span
            className="font-ui font-normal text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Detail Produk
          </span>
        </div>

        {/* Product Detail Section */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
          {/* Product Images - Left */}
          <div className="w-full lg:w-1/2">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative w-full aspect-square bg-[#f1f1f1] rounded-lg overflow-hidden flex items-center justify-center p-8">
                {currentImage ? (
                  <img
                    src={getProductImageUrl(currentImage)}
                    alt={product.nama_produk}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full bg-white flex items-center justify-center text-slate-400 text-sm ${
                    currentImage ? 'hidden' : ''
                  }`}
                >
                  Gambar Produk
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#D2001A] ring-2 ring-[#D2001A] ring-opacity-30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={getProductImageUrl(image)}
                        alt={`${product.nama_produk} - Gambar ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Information - Right */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-black font-ui font-bold text-[36px] mb-4">
              {product.nama_produk}
            </h1>

            <p
              className="font-ui font-bold text-[32px] mb-6"
              style={{ color: '#D2001A' }}
            >
              Rp {Number(price || 250000).toLocaleString('id-ID')},-
            </p>

            {priceTiers.length > 0 && (
              <div className="mb-6 border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-black font-ui font-semibold text-[18px]">Harga Tingkat</p>
                  <span className="text-xs text-slate-500">* akan diterapkan otomatis di keranjang</span>
                </div>
                <div className="space-y-2">
                  {priceTiers.map((tier) => {
                    const label = tier.label || `≥ ${tier.min_jumlah}${tier.max_jumlah ? ` - ${tier.max_jumlah}` : ''} pcs`;
                    // harga_total adalah total untuk min_jumlah item, jadi harga per item = harga_total / min_jumlah
                    const perUnit = tier.harga_total && tier.min_jumlah ? tier.harga_total / tier.min_jumlah : product.harga_ecer;
                    const sampleTotal = tier.harga_total || (perUnit * (tier.min_jumlah || 1));
                    return (
                      <div
                        key={tier.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl border border-slate-200 px-4 py-3"
                      >
                        <div>
                          <p className="font-ui font-medium text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500">
                            Min {tier.min_jumlah} pcs{tier.max_jumlah ? ` • Max ${tier.max_jumlah} pcs` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-ui font-semibold text-[18px]" style={{ color: '#D2001A' }}>
                            Rp {Number(perUnit).toLocaleString('id-ID')} / pcs
                          </p>
                          <p className="text-xs text-slate-500">
                            Total untuk {tier.min_jumlah} pcs: Rp {Number(sampleTotal).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-black font-ui font-semibold text-[18px] mb-3">
                Jumlah:
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center text-black font-ui font-bold text-[20px] hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg font-ui font-semibold text-[18px]"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center text-black font-ui font-bold text-[20px] hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
                <span className="text-black font-ui font-normal text-[16px] ml-4">
                  Tersedia {available}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 px-6 py-4 border-2 rounded-lg bg-white font-ui font-semibold text-[18px] flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                style={{ borderColor: '#D2001A', color: '#D2001A' }}
              >
                <img src={cartIcon} alt="" className="w-6 h-6" />
                Masukkan Keranjang
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 px-6 py-4 rounded-lg text-white font-ui font-semibold text-[18px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#D2001A' }}
              >
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="mb-16">
          <h2
            className="font-ui font-bold text-[32px] mb-6"
            style={{ color: '#D2001A' }}
          >
            Deskripsi Produk
          </h2>
          <div className="text-black font-ui font-normal text-[16px] leading-relaxed space-y-4">
            {product.deskripsi ? (
              <p>{product.deskripsi}</p>
            ) : (
              <p>Belum ada deskripsi produk.</p>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 h-px" style={{ backgroundColor: '#D2001A' }}></div>
              <h2
                className="font-ui font-bold text-[32px] mx-6 text-center"
                style={{ color: '#D2001A' }}
              >
                Produk lainnya yang mungkin kamu suka
              </h2>
              <div className="flex-1 h-px" style={{ backgroundColor: '#D2001A' }}></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="w-full bg-[#f1f1f1] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link to={`/products/${relatedProduct.id}`}>
                    <div className="w-full aspect-square bg-white flex items-center justify-center p-4 overflow-hidden">
                      {relatedProduct.gambar ? (
                        <img
                          src={getProductImageUrl(relatedProduct.gambar)}
                          alt={relatedProduct.nama_produk}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm ${
                          relatedProduct.gambar ? 'hidden' : ''
                        }`}
                      >
                        Gambar Produk
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-black font-ui font-medium text-[18px] mb-2 line-clamp-2">
                        {relatedProduct.nama_produk}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p
                          className="font-ui font-bold text-[24px]"
                          style={{ color: '#D2001A' }}
                        >
                          Rp {Number(relatedProduct.harga_ecer || 250000).toLocaleString('id-ID')}
                        </p>
                        <Link
                          to={`/products/${relatedProduct.id}`}
                          className="px-6 py-2 text-white font-ui font-semibold text-[16px] rounded-lg hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#D2001A' }}
                        >
                          Pesan
                        </Link>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
