import React from 'react'
import { Link } from 'react-router-dom'
import rect4 from '../assets/images/rectangle-40.png'
import rect7 from '../assets/images/rectangle-70.png'
import rect8 from '../assets/images/rectangle-80.png'
import shoppingBagIcon from '../assets/images/shopping-bag0.png'

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen lg:h-[800px] mt-[100px] bg-gradient-to-b from-white via-white to-brand-red flex items-center overflow-hidden pb-20 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-8 lg:px-16 h-full">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between h-full gap-10 lg:gap-0">

          {/* Hero Content */}
          <div className="w-full lg:w-1/2 z-20 flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0">
            <h2 className="text-brand-red font-poppins font-extrabold text-3xl sm:text-4xl lg:text-[48px] uppercase leading-tight mb-4 lg:mb-6 max-w-[790px]">
              Hidup Sehat & Alami Bersama Dante Propolis
            </h2>
            <div className="w-[100px] lg:w-[180px] h-0 border-t border-brand-red mb-6"></div>
            <p className="text-brand-red font-poppins text-base sm:text-lg lg:text-[24px] font-normal max-w-[790px] text-justify lg:text-left mb-10">
              Temukan rangkaian produk kesehatan terpercaya, skincare alami, hingga
              suplemen bernutrisi — untuk mendukung keseimbangan tubuh dan gaya hidup modern.
            </p>
            <Link
              to="/produk"
              className="w-full sm:w-[330px] h-16 sm:h-20 rounded-[50px] bg-[#D2001A] border-2 border-white flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg"
            >
              <img src={shoppingBagIcon} alt="" className="w-[24px] h-[24px] sm:w-[30px] sm:h-[30px]" />
              <span className="text-white font-poppins font-semibold text-lg sm:text-[24px]">
                Belanja Sekarang!
              </span>
            </Link>
          </div>

          {/* Hero Images */}
          <div className="w-full lg:w-1/2 relative h-[400px] sm:h-[500px] lg:h-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[600px] h-[400px] sm:h-[500px] lg:h-[600px]">
              {/* Image 1 (Left Large) */}
              <img
                src={rect8}
                alt=""
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[45%] h-[70%] rounded-[30px] lg:rounded-[50px] object-cover shadow-[10px_10px_1px_#d2001a] z-20"
              />
              {/* Image 2 (Right Top) */}
              <img
                src={rect4}
                alt=""
                className="absolute right-0 top-0 w-[45%] h-[45%] rounded-[30px] lg:rounded-[50px] object-cover shadow-[10px_10px_1px_#d2001a] z-10"
              />
              {/* Image 3 (Right Bottom) */}
              <img
                src={rect7}
                alt=""
                className="absolute right-0 bottom-0 w-[45%] h-[40%] rounded-[30px] lg:rounded-[50px] object-cover shadow-[10px_10px_1px_#d2001a] z-10"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero

