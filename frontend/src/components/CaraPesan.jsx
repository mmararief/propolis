import React from 'react'
import { Link } from 'react-router-dom'
import rect261 from '../assets/images/rectangle-261.png'
import rect262 from '../assets/images/rectangle-262.png'
import rect263 from '../assets/images/rectangle-263.png'
import rect264 from '../assets/images/rectangle-264.png'
import rect265 from '../assets/images/rectangle-265.png'

const CaraPesan = () => {
  const steps = [
    {
      id: 1,
      image: rect262,
      title: 'Login / Daftar',
      description: 'Masuk ke akunmu atau buat akun baru.',
    },
    {
      id: 2,
      image: rect263,
      title: 'Pilih Produk',
      description: 'Telusuri dan klik produk yang kamu inginkan.',
    },
    {
      id: 3,
      image: rect261,
      title: 'Tambah ke Keranjang',
      description: 'Klik "Tambah ke Keranjang" atau "Pesan Sekarang."',
    },
    {
      id: 4,
      image: rect264,
      title: 'Checkout',
      description: 'Periksa pesanan, pilih metode pembayaran dan unggah bukti bayar',
    },
    {
      id: 5,
      image: rect265,
      title: 'Pesanan Dikirim',
      description: 'Tunggu pesananmu tiba dengan aman!',
    },
  ]

  return (
    <section className="relative w-full py-16 bg-[#f1f1f1]">
      <div className="container mx-auto px-4 sm:px-8 lg:px-16 max-w-screen-2xl">
        <h2 className="text-[#D2001A] font-poppins font-bold text-3xl sm:text-4xl lg:text-[40px] text-center mb-16">
          Bagaimana Cara Pemesanan?
        </h2>

        {/* Steps */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-4 mb-16">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center flex-1 min-w-[200px]">
              <img
                src={step.image}
                alt={step.title}
                className="w-[120px] h-[120px] object-cover mb-6"
              />
              <h3 className="text-black font-poppins font-semibold text-[20px] mb-2 min-h-[60px] flex items-center justify-center">
                {step.title}
              </h3>
              <p className="text-black font-poppins font-normal text-[15px] px-2">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            to="/produk"
            className="w-[240px] h-[60px] rounded-[50px] bg-gradient-to-r from-[#D2001A] via-[#b40016] to-[#950012] flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg"
          >
            <span className="text-white font-poppins font-bold text-[22px]">
              Pesan Sekarang
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CaraPesan

