import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import api from '../api/client';
// import { SkeletonProductCard } from '../components/Skeleton';
// import { getProductImageUrl } from '../utils/imageHelper';
import Hero from '../components/Hero';

import ProdukTerlaris from '../components/ProdukTerlaris';
// Import images

import beeSwarm from '../assets/images/bee-swarm0.png';
import rect140 from '../assets/images/rectangle-140.png';
import rect120 from '../assets/images/rectangle-120.png';
import rect130 from '../assets/images/rectangle-130.png';
// import arrowIcon from '../assets/images/arrow-10.svg';
import rect262 from '../assets/images/rectangle-262.png';
import rect263 from '../assets/images/rectangle-263.png';
import rect261 from '../assets/images/rectangle-261.png';
import rect264 from '../assets/images/rectangle-264.png';
import rect265 from '../assets/images/rectangle-265.png';
import rect350 from '../assets/images/rectangle-350.png';
import rect370 from '../assets/images/rectangle-370.png';
import rect400 from '../assets/images/rectangle-400.png';
import whatsappIcon from '../assets/images/whats-app0.png';
import emailIcon from '../assets/images/email0.png';
import instagramIcon from '../assets/images/instagram0.png';
import homeIcon from '../assets/images/home0.png';
import productIcon from '../assets/images/product0.png';
import beeIcon from '../assets/images/bee0.png';
import mapIcon from '../assets/images/map0.png';
import phoneIcon from '../assets/images/phone0.png';
import email1Icon from '../assets/images/email1.png';
import clockIcon from '../assets/images/clock0.png';

const HomePage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // FAQ pertama terbuka default

  const faqs = [
    {
      id: 0,
      question: 'Apakah produk Dante Propolis aman digunakan setiap hari?',
      answer: 'Ya, produk kami terbuat dari bahan alami dan sudah teruji aman untuk penggunaan harian sesuai aturan pakai.',
    },
    {
      id: 1,
      question: 'Apakah produk Dante Propolis aman digunakan untuk anak-anak?',
      answer: '',
    },
    {
      id: 2,
      question: 'Berapa lama waktu pengiriman pesanan saya?',
      answer: '',
    },
    {
      id: 3,
      question: 'Apakah bisa memesan per dus?',
      answer: '',
    },
    {
      id: 4,
      question: 'Bagaimana jika ingin konsultasi?',
      answer: '',
    },
  ];

  return (
    <div className="relative w-full overflow-x-hidden bg-white pt-[60px]">
      <Hero />

            {/* ===== KEUNGGULAN SECTION ===== */}
      <div
        className="relative w-full"
        style={{ backgroundColor: '#D2001A' }}
      >
        <div className="relative w-full max-w-[1920px] mx-auto">
          {/* Desktop Layout */}
          <div className="hidden xl:block py-20">
            <div className="text-center mb-16">
              <div className="text-[55px] font-ui font-normal text-white mb-2">
                Selamat Datang di
              </div>
              <div className="text-[48px] font-brand font-normal text-white mb-2">
                DANTE PROPOLIS
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-[270px] h-0 border-t border-white"></div>
                <img
                  src={beeSwarm}
                  alt=""
                  className="w-[40px] h-[40px] object-cover"
                />
                <div className="w-[270px] h-0 border-t border-white"></div>
              </div>
            </div>

            <div className="flex items-start justify-center gap-16 xl:gap-24">
              <div className="flex flex-col items-center max-w-[317px]">
                <img
                  src={rect140}
                  alt=""
                  className="w-[200px] h-[200px] object-cover mb-4"
                />
                <div className="text-white font-ui font-medium text-[30px] text-center">
                  Distributor Resmi
                </div>
              </div>

              <div className="flex flex-col items-center max-w-[317px]">
                <img
                  src={rect120}
                  alt=""
                  className="w-[200px] h-[200px] object-cover mb-4"
                />
                <div className="text-white font-ui font-medium text-[30px] text-center">
                  Produk Berkualitas
                </div>
              </div>

              <div className="flex flex-col items-center max-w-[317px]">
                <img
                  src={rect130}
                  alt=""
                  className="w-[200px] h-[200px] object-cover mb-4"
                />
                <div className="text-white font-ui font-medium text-[30px] text-center">
                  Layanan Terpercaya
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="xl:hidden container mx-auto px-4 sm:px-8 lg:px-16 py-16">
            <div className="text-center mb-16">
              <div className="text-3xl sm:text-4xl lg:text-[55px] font-ui font-normal text-white mb-2">
                Selamat Datang di
              </div>
              <div className="text-2xl sm:text-3xl lg:text-[48px] font-brand font-normal text-white mb-4">
                DANTE PROPOLIS
              </div>
              <div className="flex items-center justify-center gap-2 mb-12">
                <div className="w-[100px] sm:w-[200px] lg:w-[270px] h-0.5 bg-white"></div>
                <img
                  src={beeSwarm}
                  alt=""
                  className="w-[40px] h-[40px] object-cover"
                />
                <div className="w-[100px] sm:w-[200px] lg:w-[270px] h-0.5 bg-white"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
              <div className="flex flex-col items-center">
                <img
                  src={rect140}
                  alt=""
                  className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] object-cover mb-4"
                />
                <div className="text-white font-ui font-medium text-xl sm:text-2xl lg:text-[30px] text-center">
                  Distributor Resmi
                </div>
              </div>

              <div className="flex flex-col items-center">
                <img
                  src={rect120}
                  alt=""
                  className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] object-cover mb-4"
                />
                <div className="text-white font-ui font-medium text-xl sm:text-2xl lg:text-[30px] text-center">
                  Produk Berkualitas
                </div>
              </div>

              <div className="flex flex-col items-center">
                <img
                  src={rect130}
                  alt=""
                  className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] object-cover mb-4"
                />
                <div className="text-white font-ui font-medium text-xl sm:text-2xl lg:text-[30px] text-center">
                  Layanan Terpercaya
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ===== BEST SELLERS SECTION ===== */}
      <ProdukTerlaris />
      {/* ===== CARA PEMESANAN SECTION ===== */}
      <div className="relative w-full py-16" style={{ backgroundColor: '#f1f1f1' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px]">
          <h2
            className="font-ui font-bold text-center mb-12"
            style={{
              color: '#D2001A',
              fontSize: 'clamp(28px, 3vw, 40px)',
            }}
          >
            Bagaimana Cara Pemesanan?
          </h2>

          {/* Steps - Desktop flex layout */}
          <div className="hidden xl:flex justify-center items-start gap-8 mb-12">
            {[
              { img: rect262, title: 'Login / Daftar', desc: 'Masuk ke akunmu atau buat akun baru.' },
              { img: rect263, title: 'Pilih Produk', desc: 'Telusuri dan klik produk yang kamu inginkan.' },
              { img: rect261, title: 'Tambah ke Keranjang', desc: 'Klik "Tambah ke Keranjang" atau "Pesan Sekarang."' },
              { img: rect264, title: 'Checkout', desc: 'Periksa pesanan, pilih metode pembayaran dan unggah bukti bayar' },
              { img: rect265, title: 'Pesanan Dikirim', desc: 'Tunggu pesananmu tiba dengan aman!' },
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center w-[200px]">
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-[120px] h-[120px] object-cover mb-4"
                />
                <h3 className="text-black font-ui font-semibold text-center text-[20px] mb-2 min-h-[30px] flex items-center justify-center">
                  {step.title}
                </h3>
                <p className="text-black font-ui font-normal text-center text-[15px] px-2">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Steps - Mobile/Tablet grid */}
          <div className="xl:hidden mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
              {[
                { img: rect262, title: 'Login / Daftar', desc: 'Masuk ke akunmu atau buat akun baru.' },
                { img: rect263, title: 'Pilih Produk', desc: 'Telusuri dan klik produk yang kamu inginkan.' },
                { img: rect261, title: 'Tambah ke Keranjang', desc: 'Klik "Tambah ke Keranjang" atau "Pesan Sekarang."' },
                { img: rect264, title: 'Checkout', desc: 'Periksa pesanan, pilih metode pembayaran dan unggah bukti bayar' },
                { img: rect265, title: 'Pesanan Dikirim', desc: 'Tunggu pesananmu tiba dengan aman!' },
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] object-cover mb-4"
                  />
                  <h3 className="text-base sm:text-lg lg:text-[20px] font-ui font-semibold text-black mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base lg:text-[15px] font-ui font-normal text-black text-center">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              to="/products"
              className="w-[240px] h-[60px] rounded-[50px] flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{
                background: 'linear-gradient(90deg, #d2001a 0%, #b40016 50%, #950012 100%)',
              }}
            >
              <span className="text-white font-ui font-bold text-lg sm:text-xl lg:text-[22px]">
                Pesan Sekarang
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== FAQ SECTION ===== */}
      <div className="relative w-full py-16 bg-gradient-to-b from-[#f1f1f1] to-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px]">
          {/* Desktop Layout */}
          <div className="hidden xl:grid xl:grid-cols-2 xl:gap-16">
            {/* Left Side - Contact Card */}
            <div className="w-full">
              <img
                src={rect370}
                alt=""
                className="w-full h-[180px] object-cover rounded-t-[50px]"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="bg-[#f1f1f1] rounded-b-[50px] p-10">
                <img
                  src={rect350}
                  alt=""
                  className="w-[100px] h-[100px] object-cover mx-auto mb-5"
                />
                <h3 className="text-black font-ui font-bold text-[30px] text-center mb-3">
                  Apakah punya pertanyaan lain?
                </h3>
                <p className="text-black font-ui font-normal text-[18px] text-center mb-5">
                  Jangan ragu untuk menghubungi kami! tim kami siap membantu dengan cepat dan ramah.
                </p>
                <Link
                  to="/about"
                  className="w-[187px] h-[60px] rounded-[50px] flex items-center justify-center mx-auto hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  <span className="text-white font-ui font-bold text-[22px]">
                    Hubungi Kami
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Side - FAQ */}
            <div className="w-full">
              <h2
                className="font-ui font-bold text-[45px] uppercase text-right mb-10"
                style={{ color: '#D2001A' }}
              >
                Fequently Asked Question (FAQ)
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  return (
                    <div
                      key={faq.id}
                      className={`w-full rounded-[10px] px-5 py-4 flex flex-col cursor-pointer transition-all ${openFaqIndex === index
                        ? 'min-h-[120px] bg-[#d9d9d9]'
                        : 'h-[60px] border border-[#9b9b9b] bg-white hover:bg-slate-50'
                        }`}
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                    >
                      <div className="flex items-center justify-between h-full min-h-[20px]">
                        <p
                          className={`font-ui font-bold text-[18px] flex-1 pr-4 ${openFaqIndex === index ? 'text-white' : 'text-black'
                            }`}
                        >
                          {faq.question}
                        </p>
                        <div className="flex items-center justify-center w-[30px] h-[30px] shrink-0">
                          {openFaqIndex === index ? (
                            // Minus icon (horizontal line only) - putih
                            <div className="w-[30px] h-[3px] bg-white"></div>
                          ) : (
                            // Plus icon (horizontal + vertical line) - merah
                            <div className="relative w-[30px] h-[30px]">
                              <div className="absolute top-1/2 left-0 w-[30px] h-[3px] -translate-y-1/2" style={{ backgroundColor: '#D2001A' }}></div>
                              <div className="absolute top-0 left-1/2 w-[3px] h-[30px] -translate-x-1/2" style={{ backgroundColor: '#D2001A' }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                      {openFaqIndex === index && faq.answer && (
                        <p className="text-white font-ui font-normal text-[18px] mt-3">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="xl:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Left Side - Contact Card */}
              <div className="w-full bg-[#f1f1f1] rounded-b-[50px] flex flex-col items-center justify-center p-8 lg:p-12">
                <img
                  src={rect350}
                  alt=""
                  className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] object-cover mb-4"
                />
                <h3 className="text-xl sm:text-2xl lg:text-[30px] font-ui font-bold text-black mb-4 text-center">
                  Apakah punya pertanyaan lain?
                </h3>
                <p className="text-base sm:text-lg lg:text-[18px] font-ui font-normal text-black mb-6 text-center max-w-[502px]">
                  Jangan ragu untuk menghubungi kami! tim kami siap membantu dengan cepat dan ramah.
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center w-full sm:w-[187px] h-[60px] rounded-[50px] hover:opacity-90 transition"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  <span className="text-white font-ui font-bold text-lg sm:text-xl lg:text-[22px]">Hubungi Kami</span>
                </Link>
              </div>

              {/* Right Side - FAQ */}
              <div className="w-full">
                <h2
                  className="text-2xl sm:text-3xl lg:text-[45px] font-ui font-bold uppercase text-right mb-8"
                  style={{ color: '#D2001A' }}
                >
                  Fequently Asked Question (FAQ)
                </h2>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className={`w-full rounded-[10px] px-5 py-4 flex flex-col cursor-pointer transition-all ${openFaqIndex === index
                        ? 'min-h-[120px] bg-[#d9d9d9]'
                        : 'h-[60px] border border-[#9b9b9b] bg-white hover:bg-slate-50'
                        }`}
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                    >
                      <div className="flex items-center justify-between h-full min-h-[20px]">
                        <p
                          className={`font-ui font-bold text-base sm:text-lg flex-1 pr-4 ${openFaqIndex === index ? 'text-white' : 'text-black'
                            }`}
                        >
                          {faq.question}
                        </p>
                        <div className="flex items-center justify-center w-[30px] h-[30px] shrink-0">
                          {openFaqIndex === index ? (
                            // Minus icon (horizontal line only) - putih
                            <div className="w-[30px] h-[3px] bg-white"></div>
                          ) : (
                            // Plus icon (horizontal + vertical line) - merah
                            <div className="relative w-[30px] h-[30px]">
                              <div className="absolute top-1/2 left-0 w-[30px] h-[3px] -translate-y-1/2" style={{ backgroundColor: '#D2001A' }}></div>
                              <div className="absolute top-0 left-1/2 w-[3px] h-[30px] -translate-x-1/2" style={{ backgroundColor: '#D2001A' }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                      {openFaqIndex === index && faq.answer && (
                        <p className="text-white font-ui font-normal text-base sm:text-lg mt-3">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTACT SECTION ===== */}
      <div className="relative w-full min-h-[390px] py-12 bg-gradient-to-b from-white via-[#e9808c] to-[#D2001A]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-[160px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <img
              src={rect400}
              alt=""
              className="w-full h-[200px] sm:h-[300px] lg:h-[390px] object-cover"
            />
            <div className="flex-1">
              <h2
                className="text-2xl sm:text-3xl lg:text-[48px] font-ui font-bold mb-4"
                style={{
                  color: '#D2001A',
                  WebkitTextStroke: '1px #fff',
                  textStroke: '1px #fff'
                }}
              >
                Tetap Terhubung dengan Kami
              </h2>
              <p className="text-lg sm:text-xl lg:text-[24px] font-ui font-normal text-white mb-2">
                Kami senang bisa lebih dekat denganmu
              </p>
              <p className="text-sm sm:text-base lg:text-[16px] font-ui font-normal text-white mb-8">
                Hubungi kami untuk konsultasi produk, pemesanan, atau kerja sama.
              </p>
              <div className="flex gap-4">
                <img
                  src={whatsappIcon}
                  alt="WhatsApp"
                  className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] object-cover cursor-pointer hover:opacity-80"
                />
                <img
                  src={emailIcon}
                  alt="Email"
                  className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] object-cover cursor-pointer hover:opacity-80"
                />
                <img
                  src={instagramIcon}
                  alt="Instagram"
                  className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] object-cover cursor-pointer hover:opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div 
        className="relative w-full min-h-[450px] py-12"
        style={{
          background: 'linear-gradient(180deg, rgba(210,0,26,1) 40%, rgba(88,0,11,1) 100%)'
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 mb-8">
            {/* Brand & Description */}
            <div className="w-full">
              <div className="flex flex-col gap-1 mb-6 items-end">
                <div 
                  className="text-2xl sm:text-3xl lg:text-[40px] leading-none text-white text-right"
                  style={{ fontFamily: "'Racing Sans One', Helvetica, sans-serif" }}
                >
                  <span>BRITISH </span>
                  <span>PROPOLIS</span>
                </div>
                <div className="text-xs sm:text-sm lg:text-[12px] font-ui text-white text-right">
                  <span>Distributor Resmi </span>
                  <span 
                    style={{ fontFamily: "'Racing Sans One', Helvetica, sans-serif" }}
                  >
                    DANTE PROPOLIS
                  </span>
                </div>
              </div>
              <p className="text-base sm:text-lg lg:text-[24px] font-ui font-normal text-white text-justify">
                Dante Propolis adalah distributor resmi British Propolis dan produk kesehatan alami terpercaya.
                Kami berkomitmen menyediakan produk berkualitas tinggi untuk mendukung gaya hidup sehat Anda.
              </p>
            </div>

            {/* Navigasi Cepat */}
            <div className="flex-1 flex flex-col items-center text-center">
              <h3 className="text-lg sm:text-xl lg:text-[24px] font-ui font-semibold text-white mb-6">Navigasi Cepat</h3>
              <div className="space-y-4">
                <Link to="/" className="flex items-center gap-3 text-white hover:text-slate-200">
                  <img
                    src={homeIcon}
                    alt=""
                    className="w-[30px] h-[30px] object-cover"
                  />
                  <span className="text-base sm:text-lg lg:text-[20px] font-ui font-normal">Beranda</span>
                </Link>
                <Link to="/products" className="flex items-center gap-3 text-white hover:text-slate-200">
                  <img
                    src={productIcon}
                    alt=""
                    className="w-[30px] h-[30px] object-cover"
                  />
                  <span className="text-base sm:text-lg lg:text-[20px] font-ui font-normal">Produk</span>
                </Link>
                <Link to="/about" className="flex items-center gap-3 text-white hover:text-slate-200">
                  <img
                    src={beeIcon}
                    alt=""
                    className="w-[30px] h-[30px] object-cover"
                  />
                  <span className="text-base sm:text-lg lg:text-[20px] font-ui font-normal">Tentang Kami</span>
                </Link>
              </div>
            </div>

            {/* Informasi Toko */}
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl lg:text-[24px] font-ui font-semibold text-white mb-6">Informasi Toko</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <img
                    src={mapIcon}
                    alt=""
                    className="w-[30px] h-[30px] object-cover"
                  />
                  <span className="text-base sm:text-lg lg:text-[20px] font-ui font-normal">Komplek Angkasa puri  JL. Belimbing B6 no 15, Jawa Barat</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <img
                    src={phoneIcon}
                    alt=""
                    className="w-[30px] h-[30px] object-cover"
                  />
                  <span className="text-base sm:text-lg lg:text-[20px] font-ui font-normal">0877 8409 8190</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <img
                    src={email1Icon}
                    alt=""
                    className="w-[30px] h-[30px] object-cover"
                  />
                  <span className="text-base sm:text-lg lg:text-[20px] font-ui font-normal">support@dantepropolis.com</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <img
                    src={clockIcon}
                    alt=""
                    className="w-[30px] h-[30px] object-cover"
                  />
                  <span className="text-base sm:text-lg lg:text-[20px] font-ui font-normal">Jam Operasional: 07.00 – 17.00 WIB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-0.5 bg-white mt-8 mb-4"></div>
          <p className="text-sm sm:text-base lg:text-[18px] font-ui font-normal text-[#d9d9d9] text-center">
            © 2025 Dante Propolis. All rights reserved. Project by 2ITSOLUTION.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
