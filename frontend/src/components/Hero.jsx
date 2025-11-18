import React from 'react'
import { Link } from 'react-router-dom'
import rect4 from '../assets/images/rectangle-40.png'
import rect7 from '../assets/images/rectangle-70.png'
import rect8 from '../assets/images/rectangle-80.png'
import shoppingBagIcon from '../assets/images/shopping-bag0.png'

const Hero = () => {
  return (
    <section className="relative w-full h-[690px] mt-[100px] bg-gradient-to-b from-white via-white to-brand-red">
      <div className="relative w-full h-full max-w-[1920px] mx-auto">
        {/* Hero Images */}
        <img
          src={rect8}
          alt=""
          className="absolute left-[1135px] top-[109px] w-[280px] h-[420px] rounded-[50px] object-cover shadow-[15px_15px_1px_#d2001a] z-10"
        />
        <img
          src={rect4}
          alt=""
          className="absolute left-[1470px] top-[40px] w-[280px] h-[300px] rounded-[50px] object-cover shadow-[15px_15px_1px_#d2001a] z-10"
        />
        <img
          src={rect7}
          alt=""
          className="absolute left-[1474px] top-[390px] w-[280px] h-[240px] rounded-[50px] object-cover shadow-[15px_15px_1px_#d2001a] z-10"
        />

        {/* Hero Content */}
        <div className="absolute left-[150px] top-[120px] w-[790px] z-10">
          <h2 className="text-brand-red font-poppins font-extrabold text-[48px] uppercase leading-tight h-[110px] flex items-center">
            Hidup Sehat & Alami Bersama Dante Propolis
          </h2>
          <div className="absolute left-0 top-[130px] w-[180px] h-0 border-t border-brand-red"></div>
          <p className="absolute left-0 top-[160px] text-brand-red font-poppins text-[24px] font-normal w-[790px] text-justify">
            Temukan rangkaian produk kesehatan terpercaya, skincare alami, hingga
            suplemen bernutrisi — untuk mendukung keseimbangan tubuh dan gaya hidup modern.
          </p>
          <Link
            to="/produk"
            className="absolute left-0 top-[300px] w-[330px] h-20 rounded-[50px] bg-brand-red border-2 border-white flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          >
            <img src={shoppingBagIcon} alt="" className="w-[30px] h-[30px]" />
            <span className="text-white font-poppins font-semibold text-[24px]">
              Belanja Sekarang!
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero

