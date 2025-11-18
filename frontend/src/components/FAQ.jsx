import React, { useState } from 'react'
import rect35 from '../assets/images/rectangle-350.png'
import rect37 from '../assets/images/rectangle-370.png'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0)

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
  ]

  return (
    <section className="relative w-full h-[659px] bg-gradient-to-b from-[#f1f1f1] to-white">
      <div className="relative w-full h-full max-w-[1920px] mx-auto">
        {/* Left Side - Contact Card */}
        <div className="absolute left-[150px] top-[80px] w-[790px]">
          <img
            src={rect37}
            alt=""
            className="w-full h-[180px] object-cover rounded-t-[50px]"
          />
          <div className="bg-[#f1f1f1] rounded-b-[50px] p-10">
            <img
              src={rect35}
              alt=""
              className="w-[100px] h-[100px] object-cover mx-auto mb-5"
            />
            <h3 className="text-black font-poppins font-bold text-[30px] text-center mb-3">
              Apakah punya pertanyaan lain?
            </h3>
            <p className="text-black font-poppins font-normal text-[18px] text-center mb-5">
              Jangan ragu untuk menghubungi kami! tim kami siap membantu dengan cepat dan ramah.
            </p>
            <button className="w-[187px] h-[60px] rounded-[50px] bg-brand-red mx-auto block hover:opacity-90 transition-opacity">
              <span className="text-white font-poppins font-bold text-[22px]">
                Hubungi Kami
              </span>
            </button>
          </div>
        </div>

        {/* Right Side - FAQ */}
        <div className="absolute right-[150px] top-[70px] w-[790px]">
          <h2 className="text-brand-red font-poppins font-bold text-[45px] uppercase text-right mb-10">
            Fequently Asked Question (FAQ)
          </h2>

          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`w-full ${
                  openIndex === index ? 'min-h-[120px] bg-[#d9d9d9]' : 'h-[60px] border border-[#9b9b9b]'
                } rounded-[10px] px-5 py-4 flex flex-col cursor-pointer transition-all`}
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`font-poppins font-bold text-[18px] ${
                      openIndex === index ? 'text-white' : 'text-black'
                    }`}
                  >
                    {faq.question}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-[30px] h-[3px] ${
                        openIndex === index ? 'bg-white' : 'bg-brand-red'
                      }`}
                    ></div>
                    <div
                      className={`w-[3px] h-[30px] ${
                        openIndex === index ? 'bg-white rotate-90' : 'bg-brand-red rotate-90'
                      }`}
                    ></div>
                  </div>
                </div>
                {openIndex === index && faq.answer && (
                  <p className="text-white font-poppins font-normal text-[18px] mt-3">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ

