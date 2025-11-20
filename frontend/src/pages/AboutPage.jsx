const techStack = [
  'Laravel 11 + Sanctum',
  'MySQL 8 + transaksi FEFO',
  'RajaOngkir API (province → district cost)',
  'Laravel Queue + Jobs (release reservasi, notifikasi)',
  'React + Vite + Tailwind untuk frontend testing',
];

const AboutPage = () => (
  <div className="card space-y-4">
    <div>
      <p className="text-sm uppercase tracking-wider text-primary font-semibold">Tentang Platform</p>
      <h1 className="text-2xl font-bold text-slate-900">Ekosistem Fulfillment Propolis</h1>
    </div>
    <p className="text-slate-600 leading-relaxed">
      Kami membangun platform ini untuk membantu tim distribusi propolis memonitor stok produk secara real time, memproses
      pesanan pelanggan, dan mengotomasi perhitungan ongkir hingga laporan penjualan. Sistem ini siap diintegrasikan dengan
      aplikasi produksi ataupun website e-commerce utama.
    </p>
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Teknologi Utama</h2>
      <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
        {techStack.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-primary">✔</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default AboutPage;

