import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full text-white" style={{ backgroundColor: '#D2001A' }}>
            <div className="container-layout py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Column 1: Branding and Description */}
                    <div className="space-y-6">
                        <div className="flex flex-col items-start">
                            <div
                                className="text-[28px] md:text-[32px] leading-none"
                                style={{ fontFamily: "'Racing Sans One', Helvetica, sans-serif" }}
                            >
                                <span className="text-white">BRITISH </span>
                                <span className="text-white">PROPOLIS</span>
                            </div>
                            <div className="text-[10px] md:text-[12px] font-ui mt-1">
                                <span className="text-white">Distributor Resmi </span>
                                <span
                                    style={{
                                        fontFamily: "'Racing Sans One', Helvetica, sans-serif",
                                    }}
                                >
                                    DANTE PROPOLIS
                                </span>
                            </div>
                        </div>

                        <p className="font-ui text-sm leading-relaxed text-white/90 max-w-sm text-justify">
                            Dante Propolis adalah distributor resmi British Propolis dan produk kesehatan
                            alami terpercaya. Kami berkomitmen menyediakan produk berkualitas tinggi
                            untuk mendukung gaya hidup sehat Anda.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-ui font-bold text-lg mb-6">Navigasi Cepat</h3>
                        <ul className="space-y-4 font-ui text-sm">
                            <li>
                                <Link to="/" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                                    <span className="text-xl">🏠</span> Beranda
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                                    <span className="text-xl">📦</span> Produk
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                                    <span className="text-xl">🐝</span> Tentang Kami
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="font-ui font-bold text-lg mb-6">Informasi Toko</h3>
                        <ul className="space-y-4 font-ui text-sm">
                            <li className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">📍</span>
                                <span>Komplek Angkasa puri  JL. Belimbing B6 no 15, Jawa Barat</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-xl">📞</span>
                                <span>0877 8409 8190</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-xl">✉️</span>
                                <span>support@dantepropolis.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">🕒</span>
                                <span>Jam Operasional: 07.00 – 17.00 WIB</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-white/20">
                <div className="container-layout py-6 text-center">
                    <p className="font-ui text-xs md:text-sm text-white/80">
                        © 2025 Dante Propolis. All rights reserved. Project by 2ITSOLUTION.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
