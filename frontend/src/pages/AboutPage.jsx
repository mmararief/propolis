import React from 'react';
import { Link } from 'react-router-dom';
import aboutImage from '../assets/images/british-propolis-about.png'; // Make sure this matches the copied file

import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col pt-[70px]">
      {/* Header Section */}
      <div className="text-center py-8 bg-white border-b border-gray-100">
        <h1 className="text-[40px] font-bold mb-2 font-ui" style={{ color: '#D2001A' }}>
          TENTANG KAMI
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm font-ui">
          <Link to="/" className="hover:underline text-gray-600">
            Beranda
          </Link>
          <span className="text-gray-400">&gt;</span>
          <span className="font-semibold" style={{ color: '#D2001A' }}>
            Tentang Kami
          </span>
        </div>
      </div>

      {/* Main Content Section - White background wrapper around container */}
      <div className="w-full bg-white flex-1">
        <div className="container-layout py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left Column: Image */}
            <div className="w-full lg:w-1/2">
              <div className="rounded-none overflow-hidden shadow-none">
                <img
                  src={aboutImage}
                  alt="Produk British Propolis"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Right Column: Text */}
            <div className="w-full lg:w-1/2 font-ui">
              {/* Logo Text */}
              <div className="mb-4">
                <h2 className="text-xl font-bold italic inline-block">
                  <span className="text-[#D2001A]">DANTE</span> <span className="text-[#0056b3]">PROPOLIS</span>
                </h2>
              </div>

              {/* Headline */}
              <h3 className="text-3xl lg:text-[40px] font-bold leading-tight mb-6" style={{ color: '#D2001A' }}>
                Distributor Resmi British Propolis
              </h3>

              {/* Paragraphs */}
              <div className="space-y-6 text-gray-700 text-[15px] leading-relaxed text-justify">
                <p>
                  Toko Dante Propolis adalah distributor resmi British Propolis yang berkomitmen
                  menyediakan produk original, berkualitas, dan aman untuk kesehatan keluarga
                  Indonesia. Sebagai mitra resmi, kami memastikan setiap produk yang kami jual berasal
                  langsung dari distributor pusat, sehingga pelanggan tidak perlu khawatir soal keaslian
                  maupun keamanan produknya.
                </p>

                <p>
                  Sejak berdiri, Toko Dante Propolis fokus memberikan layanan terbaik dengan proses
                  pemesanan yang mudah, pengemasan rapi, dan pengiriman cepat ke seluruh
                  Indonesia. Kami percaya bahwa menjaga kesehatan adalah investasi penting, dan
                  produk British Propolis hadir sebagai salah satu pilihan terbaik untuk mendukung
                  imunitas dan stamina tubuh.
                </p>

                <p>
                  Dengan pengalaman dalam melayani pembeli umum maupun reseller, kami terus
                  berupaya meningkatkan kualitas pelayanan agar setiap pelanggan mendapatkan
                  pengalaman belanja yang nyaman dan memuaskan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
