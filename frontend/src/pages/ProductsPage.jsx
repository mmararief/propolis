import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { SkeletonProductCard } from '../components/Skeleton';
import { getProductImageUrl } from '../utils/imageHelper';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products');
        let fetchedProducts = data.data?.data ?? data.data ?? [];
        
        // Filter by search query if exists
        if (searchQuery) {
          fetchedProducts = fetchedProducts.filter((product) =>
            product.nama_produk?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  return (
    <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
      <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
        {/* Title */}
        <h1
          className="font-ui font-bold text-[48px] text-center mb-4 uppercase"
          style={{ color: '#D2001A' }}
        >
          PRODUK
        </h1>

        {/* Breadcrumbs */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <Link
            to="/"
            className="font-ui font-normal text-[16px] text-black hover:opacity-70 transition-colors"
            style={{ color: '#000000' }}
          >
            Beranda
          </Link>
          <span className="font-ui font-normal text-[16px] text-black"> &gt; </span>
          <span
            className="font-ui font-normal text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Produk
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State - Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonProductCard key={index} />
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="w-full bg-[#f1f1f1] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="w-full aspect-square bg-white flex items-center justify-center p-4 overflow-hidden">
                      {product.gambar ? (
                        <img
                          src={getProductImageUrl(product.gambar)}
                          alt={product.nama_produk}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm ${
                          product.gambar ? 'hidden' : ''
                        }`}
                      >
                        Gambar Produk
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="text-black font-ui font-medium text-[18px] mb-2 line-clamp-2">
                        {product.nama_produk}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p
                          className="font-ui font-bold text-[24px]"
                          style={{ color: '#D2001A' }}
                        >
                          Rp {Number(product.harga_ecer || 250000).toLocaleString('id-ID')}
                        </p>
                        <Link
                          to={`/products/${product.id}`}
                          className="px-6 py-2 text-white font-ui font-semibold text-[16px] rounded-lg hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#D2001A' }}
                        >
                          Pesan
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                <p>Tidak ada produk ditemukan</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
