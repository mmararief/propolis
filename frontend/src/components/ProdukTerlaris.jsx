import React from 'react'
import { Link } from 'react-router-dom'
import rect27 from '../assets/images/rectangle-270.png'
import rect18 from '../assets/images/rectangle-180.png'
import rect19 from '../assets/images/rectangle-190.png'
import rect17 from '../assets/images/rectangle-170.png'
import arrowIcon from '../assets/images/arrow-10.svg'

const ProdukTerlaris = () => {
  const products = [
    { id: 1, image: rect27, name: 'British Propolis (D...)', price: 'Rp 250.000' },
    { id: 2, image: rect18, name: 'Steffi Pro', price: 'Rp 250.000' },
    { id: 3, image: rect19, name: 'British Propolis Gr...', price: 'Rp 250.000' },
    { id: 4, image: rect17, name: 'Belgie Face Serum', price: 'Rp 250.000' },
  ]

  return (
    <section className="relative w-full h-[659px] bg-[#f1f1f1]">
      <div className="relative w-full h-full max-w-[1920px] mx-auto">
        {/* Header */}
        <h2 className="absolute left-[150px] top-[70px] text-brand-red font-poppins font-bold text-[48px] uppercase">
          produk terlaris
        </h2>
        <p className="absolute left-[150px] top-[130px] text-black font-poppins font-light text-[22px]">
          Temukan produk-produk unggulan yang paling dipercaya pelanggan kami.
        </p>
        <div className="absolute left-[1550px] top-[63px] w-[220px] h-[74px] rounded-[50px] bg-brand-red z-10">
          <Link
            to="/produk"
            className="absolute left-[20px] top-[15px] w-[149px] h-[44px] flex items-center justify-center text-white font-poppins font-bold text-[20px] hover:opacity-90 transition-opacity"
          >
            Lihat Semua
          </Link>
        </div>
        <img src={arrowIcon} alt="" className="absolute left-[1718.84px] top-[37px] w-[28.65px] z-20" />

        {/* Products Grid */}
        {products.map((product, index) => {
          const positions = [
            { left: '150px', imgLeft: '160px', titleTop: '330px', priceTop: '360px' },
            { left: '580px', imgLeft: '590px', titleTop: '330px', priceTop: '360px' },
            { left: '1020px', imgLeft: '1030px', titleTop: '330px', priceTop: '360px' },
            { left: '1450px', imgLeft: '1460px', titleTop: '330px', priceTop: '360px' },
          ]
          const pos = positions[index]
          return (
            <div
              key={product.id}
              className="absolute w-[320px] h-[400px] bg-white border border-[#d9d9d9]"
              style={{ left: pos.left, top: '190px' }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="absolute w-[300px] h-[310px] object-cover"
                style={{ left: '10px', top: '10px' }}
              />
              <h3
                className="absolute text-black font-poppins font-medium text-[18px] flex items-center"
                style={{ left: '10px', top: pos.titleTop, width: '180px' }}
              >
                {product.name}
              </h3>
              <p
                className="absolute text-brand-red font-poppins font-bold text-[24px] flex items-center"
                style={{ left: '10px', top: pos.priceTop, width: '180px' }}
              >
                {product.price}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ProdukTerlaris

