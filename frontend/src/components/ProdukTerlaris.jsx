import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { GoArrowRight } from "react-icons/go";
import arrowIcon from '../assets/images/arrow-10.svg'

const ProdukTerlaris = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products?limit=4')
        // Handle different response structures just in case
        const productList = data.data?.data ?? data.data ?? []
        setProducts(productList.slice(0, 4))
      } catch (error) {
        console.error('Error fetching best sellers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Helper to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section className="relative w-full py-16 bg-[#f1f1f1]">
      <div className="container mx-auto px-4 sm:px-8 lg:px-16 max-w-screen-2xl">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-[#D2001A] font-poppins font-bold text-3xl sm:text-4xl lg:text-[48px] uppercase mb-2">
              PRODUK TERLARIS
            </h2>
            <p className="text-black font-poppins font-light text-lg sm:text-[18px]">
              Temukan produk-produk unggulan yang paling dipercaya pelanggan kami.
            </p>
          </div>

          {/* Desktop "Lihat Semua" Button */}
          <div className="hidden lg:block mb-2">
            <Link
              to="/products"
              className="flex items-center justify-center w-fit h-[40px] px-6 bg-[#D2001A] rounded-[50px] text-white font-poppins font-bold text-[14px] hover:opacity-90 transition-opacity gap-2 shadow-md"
            >
              Lihat Semua
              <GoArrowRight className="w-8 h-8" />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Loading Skeletons
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-[400px] animate-pulse"></div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-[#d9d9d9] rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                <div className="relative pt-[100%] w-full bg-gray-50">
                  <img
                    src={product.gambar || 'https://placehold.co/300x300?text=No+Image'}
                    alt={product.nama_produk}
                    className="absolute top-0 left-0 w-full h-full object-cover p-4"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-black font-poppins font-medium text-[18px] mb-2 line-clamp-2 flex-grow">
                    {product.nama_produk}
                  </h3>
                  <p className="text-brand-red font-poppins font-bold text-[24px]">
                    {formatPrice(product.harga_ecer)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              Belum ada produk terlaris saat ini.
            </div>
          )}
        </div>

        {/* Mobile "Lihat Semua" Button */}
        <div className="mt-8 lg:hidden flex justify-center">
          <Link
            to="/products"
            className="flex items-center justify-center w-fit h-[44px] px-6 bg-[#D2001A] rounded-[50px] text-white font-poppins font-bold text-[16px] hover:opacity-90 transition-opacity gap-2"
          >
            Lihat Semua
            <img src={arrowIcon} alt="" className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  )
}

export default ProdukTerlaris

