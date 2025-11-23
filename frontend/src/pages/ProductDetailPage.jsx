import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import cartIcon from '../assets/images/shopping-cart0.png';
import { SkeletonText, SkeletonButton, SkeletonProductCard } from '../components/Skeleton';
import { getProductImageUrl } from '../utils/imageHelper';
import { FaCheckCircle } from 'react-icons/fa';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addItem, clearCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [baseQuantity, setBaseQuantity] = useState(3); // Jumlah dasar (1, 3, atau 5)
  const [multiplier, setMultiplier] = useState(1); // Berapa kali (x1, x2, x3, dll)
  const [showToast, setShowToast] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const productResponse = await api.get(`/products/${id}`);
        const productData = productResponse.data.data;
        setProduct(productData);
        
        // Set default variant jika produk punya variants
        if (productData.variants && productData.variants.length > 0) {
          // Pilih varian pertama yang aktif dan punya stok
          const availableVariant = productData.variants.find(
            (v) => v.status === 'aktif' && (v.stok_available || v.stok - v.stok_reserved) > 0
          ) || productData.variants[0];
          setSelectedVariant(availableVariant);
          
          // Set default baseQuantity dari pack pertama yang tersedia
          const availablePacks = (availableVariant.packs || []).filter(p => p.status === 'aktif').sort((a, b) => a.pack_size - b.pack_size);
          if (availablePacks.length > 0) {
            setBaseQuantity(availablePacks[0].pack_size);
            setMultiplier(1);
            setQuantity(availablePacks[0].pack_size);
          } else {
            // Fallback jika tidak ada pack
            setBaseQuantity(1);
            setMultiplier(1);
            setQuantity(1);
          }
        } else {
          // Produk tanpa variant: cek packs langsung dari product
          const availablePacks = (productData.packs || []).filter(p => p.status === 'aktif').sort((a, b) => a.pack_size - b.pack_size);
          if (availablePacks.length > 0) {
            setBaseQuantity(availablePacks[0].pack_size);
            setMultiplier(1);
            setQuantity(availablePacks[0].pack_size);
          } else {
            // Fallback jika tidak ada pack
            setBaseQuantity(1);
            setMultiplier(1);
            setQuantity(1);
          }
        }
        
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
    
    // Jika ada selected variant, gunakan stok dari variant
    if (selectedVariant) {
      return Math.max(0, selectedVariant.stok_available || (selectedVariant.stok || 0) - (selectedVariant.stok_reserved || 0));
    }
    
    // Jika produk punya variants tapi belum dipilih, return 0
    if (product.variants && product.variants.length > 0) {
      return 0;
    }
    
    // Produk tanpa variant: gunakan stok produk langsung
    // Cek apakah stok_available sudah dihitung di backend
    if (typeof product.stok_available === 'number') {
      return Math.max(0, product.stok_available);
    }
    
    // Fallback: hitung manual dari stok dan stok_reserved
    const stok = product.stok || 0;
    const stokReserved = product.stok_reserved || 0;
    return Math.max(0, stok - stokReserved);
  };

  // Get available packs based on selected variant or product
  const getAvailablePacks = () => {
    if (!product) return [];
    
    if (selectedVariant) {
      // Jika ada selected variant, gunakan packs dari variant
      return (selectedVariant.packs || []).filter(p => p.status === 'aktif').sort((a, b) => a.pack_size - b.pack_size);
    }
    
    // Jika produk punya variants tapi belum dipilih, return empty
    if (product.variants && product.variants.length > 0) {
      return [];
    }
    
    // Produk tanpa variant: gunakan packs langsung dari product
    return (product.packs || []).filter(p => p.status === 'aktif').sort((a, b) => a.pack_size - b.pack_size);
  };
  
  const getCurrentPrice = () => {
    // Prioritas: pack harga > variant harga > product pack harga > product harga
    if (selectedVariant) {
      // Cari pack berdasarkan baseQuantity
      const pack = selectedVariant.packs?.find(p => p.pack_size === baseQuantity && p.status === 'aktif');
      
      // Jika ada pack dengan harga_pack, gunakan harga per unit dari pack
      if (pack && pack.harga_pack) {
        return pack.harga_pack / pack.pack_size;
      }
      
      // Jika variant punya harga_ecer, gunakan itu
      if (selectedVariant.harga_ecer) {
        return selectedVariant.harga_ecer;
      }
    }
    
    // Jika produk tidak punya variant tapi punya packs langsung
    if (!selectedVariant && product?.packs && product.packs.length > 0) {
      const pack = product.packs.find(p => p.pack_size === baseQuantity && p.status === 'aktif');
      if (pack && pack.harga_pack) {
        return pack.harga_pack / pack.pack_size;
      }
    }
    
    // Fallback ke harga produk
    return product?.harga_ecer || 250000;
  };

  // Calculate total price based on quantity
  const getTotalPrice = () => {
    const unitPrice = getCurrentPrice();
    return unitPrice * quantity;
  };

  const handleBaseQuantitySelect = (baseQty) => {
    setBaseQuantity(baseQty);
    const available = getAvailableStock();
    const maxMultiplier = Math.floor(available / baseQty);
    // Adjust multiplier jika melebihi stok
    if (multiplier > maxMultiplier && maxMultiplier >= 1) {
      setMultiplier(maxMultiplier);
      setQuantity(baseQty * maxMultiplier);
    } else {
      setQuantity(baseQty * multiplier);
    }
  };
  
  const handleMultiplierChange = (delta) => {
    const newMultiplier = multiplier + delta;
    const available = getAvailableStock();
    const maxMultiplier = Math.floor(available / baseQuantity);
    if (newMultiplier >= 1 && newMultiplier <= maxMultiplier) {
      setMultiplier(newMultiplier);
      setQuantity(baseQuantity * newMultiplier);
    }
  };
  
  const handleMultiplierInput = (value) => {
    const numValue = parseInt(value) || 1;
    const available = getAvailableStock();
    const maxMultiplier = Math.floor(available / baseQuantity);
    const clampedValue = Math.max(1, Math.min(numValue, maxMultiplier));
    setMultiplier(clampedValue);
    setQuantity(baseQuantity * clampedValue);
  };
  
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    // Reset quantity berdasarkan pack pertama yang tersedia dari variant
    const availablePacks = (variant.packs || []).filter(p => p.status === 'aktif').sort((a, b) => a.pack_size - b.pack_size);
    if (availablePacks.length > 0) {
      setBaseQuantity(availablePacks[0].pack_size);
      setMultiplier(1);
      setQuantity(availablePacks[0].pack_size);
    } else {
      // Fallback jika tidak ada pack
      setBaseQuantity(1);
      setMultiplier(1);
      setQuantity(1);
    }
  };


  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    try {
      if (selectedVariant) {
        // Produk dengan variant
        const pack = selectedVariant.packs?.find(p => p.pack_size === baseQuantity && p.status === 'aktif');
        await addItem(product, quantity, selectedVariant.id, pack?.id || null);
      } else if (product.packs && product.packs.length > 0) {
        // Produk tanpa variant tapi punya packs langsung
        const pack = product.packs.find(p => p.pack_size === baseQuantity && p.status === 'aktif');
        if (pack) {
          await addItem(product, quantity, null, pack.id);
        }
      } else {
        // Produk tanpa variant dan tanpa pack
        await addItem(product, quantity, null, null);
      }
      
      // Tampilkan toast notification
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      // Clear cart first for "Buy Now" behavior
      await clearCart();
      
      if (selectedVariant) {
        // Produk dengan variant
        const pack = selectedVariant.packs?.find(p => p.pack_size === baseQuantity && p.status === 'aktif');
        await addItem(product, quantity, selectedVariant.id, pack?.id || null);
      } else if (product.packs && product.packs.length > 0) {
        // Produk tanpa variant tapi punya packs langsung
        const pack = product.packs.find(p => p.pack_size === baseQuantity && p.status === 'aktif');
        if (pack) {
          await addItem(product, quantity, null, pack.id);
        }
      } else {
        // Produk tanpa variant dan tanpa pack
        await addItem(product, quantity, null, null);
      }
      
      navigate('/checkout');
    } catch (err) {
      console.error('Failed to process buy now:', err);
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
  // Gunakan gambar dari variant jika ada, atau gambar produk
  const variantImages = selectedVariant?.gambar && Array.isArray(selectedVariant.gambar) && selectedVariant.gambar.length > 0
    ? selectedVariant.gambar
    : null;
  const productImages = Array.isArray(product.gambar) ? product.gambar : (product.gambar ? [product.gambar] : []);
  const images = variantImages || productImages;
  const currentImage = images[selectedImageIndex] || null;
  const hasVariants = product.variants && product.variants.length > 0;

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
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
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

            <div className="mb-6">
              <p className="text-gray-600 font-ui font-normal text-[16px] mb-1">
                Total Harga:
              </p>
              <p
                className="font-ui font-bold text-[32px]"
                style={{ color: '#D2001A' }}
              >
                Rp {Number(getTotalPrice()).toLocaleString('id-ID')},-
              </p>
              {quantity > 1 && (
                <p className="text-gray-500 font-ui font-normal text-[14px] mt-1">
                  ({baseQuantity} botol × {multiplier} paket = {quantity} botol)
                </p>
              )}
            </div>

            {/* Variant Selector */}
            {hasVariants && (
              <div className="mb-6">
                <p className="text-black font-ui font-semibold text-[18px] mb-3">
                  Jenis:
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.variants
                    .filter((v) => v.status === 'aktif')
                    .map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      const variantStock = variant.stok_available || (variant.stok || 0) - (variant.stok_reserved || 0);
                      const isOutOfStock = variantStock <= 0;
                      
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => !isOutOfStock && handleVariantChange(variant)}
                          disabled={isOutOfStock}
                          className={`px-4 py-3 rounded-lg border-2 font-ui font-medium text-[16px] transition-all ${
                            isSelected
                              ? 'border-[#D2001A] bg-red-50 text-[#D2001A] ring-2 ring-[#D2001A] ring-opacity-30'
                              : isOutOfStock
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 bg-white text-black hover:border-[#D2001A] hover:bg-red-50'
                          }`}
                        >
                          {variant.tipe}
                          {isOutOfStock && <span className="block text-xs mt-1 text-gray-500">Stok habis</span>}
                          {!isOutOfStock && variantStock < 10 && (
                            <span className="block text-xs mt-1 text-orange-600">Tersisa {variantStock}</span>
                          )}
                        </button>
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
              
              {/* Tampilkan pack selector hanya jika ada pack yang tersedia */}
              {getAvailablePacks().length > 0 ? (
                <>
                  {/* Base Quantity Selector (dinamis berdasarkan pack yang tersedia) */}
                  <div className="mb-3">
                    <p className="text-gray-600 font-ui font-medium text-[14px] mb-2">
                      Pilih jumlah per paket:
                    </p>
                    <div className="flex gap-3">
                      {getAvailablePacks().map((pack) => {
                        const baseQty = pack.pack_size;
                        const isSelected = baseQuantity === baseQty;
                        const maxMultiplier = Math.floor(available / baseQty);
                        const canSelect = maxMultiplier >= 1;
                        
                        return (
                          <button
                            key={pack.id}
                            type="button"
                            onClick={() => canSelect && handleBaseQuantitySelect(baseQty)}
                            disabled={!canSelect}
                            className={`px-4 py-2 rounded-lg border-2 font-ui font-semibold text-[14px] transition-all ${
                              isSelected
                                ? 'border-[#D2001A] bg-[#D2001A] text-white'
                                : canSelect
                                ? 'border-gray-300 bg-white text-black hover:border-[#D2001A] hover:bg-red-50'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {baseQty} Botol
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Multiplier Input (Jumlah Paket) */}
                  <div className="mb-3">
                    <p className="text-gray-600 font-ui font-medium text-[14px] mb-2">
                      Jumlah paket:
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleMultiplierChange(-1)}
                        disabled={multiplier <= 1}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-black font-ui font-bold text-[20px] transition-colors ${
                          multiplier <= 1
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={multiplier}
                        onChange={(e) => handleMultiplierInput(e.target.value)}
                        min={1}
                        max={Math.floor(available / baseQuantity)}
                        className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg font-ui font-semibold text-[18px] focus:border-[#D2001A] focus:outline-none"
                      />
                      <button
                        onClick={() => handleMultiplierChange(1)}
                        disabled={multiplier >= Math.floor(available / baseQuantity)}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-black font-ui font-bold text-[20px] transition-colors ${
                          multiplier >= Math.floor(available / baseQuantity)
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        +
                      </button>
                      <span className="text-gray-600 font-ui font-normal text-[14px] ml-2">
                        paket
                      </span>
                    </div>
                  </div>
                  
                  {/* Total Quantity Display */}
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-black font-ui font-medium text-[16px]">
                        Total: <span className="font-bold text-[18px]" style={{ color: '#D2001A' }}>{quantity} Botol</span>
                      </span>
                    </div>
                    <div className="mt-2 text-gray-500 font-ui font-normal text-[12px]">
                      Tersedia: {available} botol
                    </div>
                  </div>
                </>
              ) : (
                /* Input quantity sederhana untuk produk tanpa pack */
                <div className="mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const newQty = Math.max(1, quantity - 1);
                        setQuantity(newQty);
                      }}
                      disabled={quantity <= 1}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-black font-ui font-bold text-[20px] transition-colors ${
                        quantity <= 1
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const numValue = parseInt(e.target.value) || 1;
                        const clampedValue = Math.max(1, Math.min(numValue, available));
                        setQuantity(clampedValue);
                      }}
                      min={1}
                      max={available}
                      className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg font-ui font-semibold text-[18px] focus:border-[#D2001A] focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const newQty = Math.min(available, quantity + 1);
                        setQuantity(newQty);
                      }}
                      disabled={quantity >= available}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-black font-ui font-bold text-[20px] transition-colors ${
                        quantity >= available
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      +
                    </button>
                    <span className="text-gray-600 font-ui font-normal text-[14px] ml-2">
                      botol
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-black font-ui font-medium text-[16px]">
                        Total: <span className="font-bold text-[18px]" style={{ color: '#D2001A' }}>{quantity} Botol</span>
                      </span>
                    </div>
                    <div className="mt-2 text-gray-500 font-ui font-normal text-[12px]">
                      Tersedia: {available} botol
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!hasVariants ? false : !selectedVariant || available === 0 || isAddingToCart}
                className={`flex-1 px-6 py-4 border-2 rounded-lg font-ui font-semibold text-[18px] flex items-center justify-center gap-2 transition-all duration-300 ${
                  (!hasVariants || (selectedVariant && available > 0))
                    ? 'bg-white hover:bg-red-50 active:scale-95'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                } ${isAddingToCart ? 'animate-pulse' : ''}`}
                style={(!hasVariants || (selectedVariant && available > 0)) ? { borderColor: '#D2001A', color: '#D2001A' } : {}}
              >
                <img 
                  src={cartIcon} 
                  alt="" 
                  className={`w-6 h-6 transition-transform duration-300 ${isAddingToCart ? 'animate-bounce' : ''}`} 
                />
                {isAddingToCart ? 'Menambahkan...' : 'Masukkan Keranjang'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!hasVariants ? false : !selectedVariant || available === 0}
                className={`flex-1 px-6 py-4 rounded-lg text-white font-ui font-semibold text-[18px] transition-opacity ${
                  (!hasVariants || (selectedVariant && available > 0))
                    ? 'hover:opacity-90'
                    : 'opacity-50 cursor-not-allowed'
                }`}
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

      {/* Toast Notification */}
      <div
        className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-in-out ${
          showToast
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white border-2 border-green-500 rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[300px] animate-slide-in">
          <FaCheckCircle className="text-green-500 text-2xl shrink-0" />
          <div className="flex-1">
            <p className="font-ui font-semibold text-gray-900 text-[16px]">
              Produk ditambahkan ke keranjang!
            </p>
            <p className="font-ui font-normal text-gray-600 text-[14px] mt-1">
              {product?.nama_produk}
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for slide-in animation */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
