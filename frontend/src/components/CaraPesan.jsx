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
    <section className="relative w-full h-[580px] bg-[#f1f1f1]">
      <div className="relative w-full h-full max-w-[1920px] mx-auto">
        <h2 className="absolute left-1/2 -translate-x-1/2 top-[70px] text-brand-red font-poppins font-bold text-[40px] text-center">
          Bagaimana Cara Pemesanan?
        </h2>

        {/* Steps */}
        <div className="absolute top-[170px] w-full">
          {steps.map((step, index) => {
            const positions = [
              { imgLeft: '190px', titleLeft: '150px', descLeft: '150px' },
              { imgLeft: '537px', titleLeft: '497px', descLeft: '497px' },
              { imgLeft: '900px', titleLeft: '845px', descLeft: '860px' },
              { imgLeft: '1262px', titleLeft: '1222px', descLeft: '1222px' },
              { imgLeft: '1610px', titleLeft: '1570px', descLeft: '1570px' },
            ]
            const pos = positions[index]
            return (
              <React.Fragment key={step.id}>
                <img
                  src={step.image}
                  alt={step.title}
                  className="absolute w-[120px] h-[120px] object-cover"
                  style={{ left: pos.imgLeft, top: '0px' }}
                />
                <h3
                  className="absolute text-black font-poppins font-semibold text-[20px] text-center flex items-center justify-center"
                  style={{ left: pos.titleLeft, top: '130px', width: '230px', height: '30px' }}
                >
                  {step.title}
                </h3>
                <p
                  className="absolute text-black font-poppins font-normal text-[15px] text-center flex items-center justify-center"
                  style={{ left: pos.descLeft, top: '160px', width: '200px', height: step.id === 2 || step.id === 3 ? '70px' : '50px' }}
                >
                  {step.description}
                </p>
              </React.Fragment>
            )
          })}
        </div>

        {/* CTA Button */}
        <Link
          to="/produk"
          className="absolute left-1/2 -translate-x-1/2 top-[450px] w-[240px] h-[60px] rounded-[50px] bg-gradient-to-r from-brand-red via-[#b40016] to-[#950012] flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <span className="text-white font-poppins font-bold text-[22px]">
            Pesan Sekarang
          </span>
        </Link>
      </div>
    </section>
  )
}

export default CaraPesan

