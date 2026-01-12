-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 09, 2026 at 12:54 AM
-- Server version: 11.4.9-MariaDB
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `xdzopyks_propolis`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('rajaongkir:cities:10', 'a:6:{i:0;a:2:{s:2:\"id\";i:135;s:4:\"name\";s:13:\"JAKARTA BARAT\";}i:1;a:2:{s:2:\"id\";i:136;s:4:\"name\";s:15:\"JAKARTA SELATAN\";}i:2;a:2:{s:2:\"id\";i:137;s:4:\"name\";s:13:\"JAKARTA PUSAT\";}i:3;a:2:{s:2:\"id\";i:138;s:4:\"name\";s:13:\"JAKARTA UTARA\";}i:4;a:2:{s:2:\"id\";i:139;s:4:\"name\";s:13:\"JAKARTA TIMUR\";}i:5;a:2:{s:2:\"id\";i:141;s:4:\"name\";s:16:\"KEPULAUAN SERIBU\";}}', 1767935636),
('rajaongkir:cities:13', 'a:11:{i:0;a:2:{s:2:\"id\";i:150;s:4:\"name\";s:5:\"JAMBI\";}i:1;a:2:{s:2:\"id\";i:152;s:4:\"name\";s:20:\"TANJUNG JABUNG BARAT\";}i:2;a:2:{s:2:\"id\";i:153;s:4:\"name\";s:8:\"MERANGIN\";}i:3;a:2:{s:2:\"id\";i:154;s:4:\"name\";s:11:\"BATANG HARI\";}i:4;a:2:{s:2:\"id\";i:156;s:4:\"name\";s:5:\"BUNGO\";}i:5;a:2:{s:2:\"id\";i:157;s:4:\"name\";s:11:\"SUNGAIPENUH\";}i:6;a:2:{s:2:\"id\";i:158;s:4:\"name\";s:7:\"KERINCI\";}i:7;a:2:{s:2:\"id\";i:160;s:4:\"name\";s:11:\"MUARO JAMBI\";}i:8;a:2:{s:2:\"id\";i:161;s:4:\"name\";s:10:\"SAROLANGUN\";}i:9;a:2:{s:2:\"id\";i:163;s:4:\"name\";s:20:\"TANJUNG JABUNG TIMUR\";}i:10;a:2:{s:2:\"id\";i:164;s:4:\"name\";s:4:\"TEBO\";}}', 1767935630),
('rajaongkir:cities:5', 'a:21:{i:0;a:2:{s:2:\"id\";i:55;s:4:\"name\";s:7:\"BANDUNG\";}i:1;a:2:{s:2:\"id\";i:56;s:4:\"name\";s:6:\"CIMAHI\";}i:2;a:2:{s:2:\"id\";i:57;s:4:\"name\";s:8:\"SUMEDANG\";}i:3;a:2:{s:2:\"id\";i:59;s:4:\"name\";s:5:\"GARUT\";}i:4;a:2:{s:2:\"id\";i:60;s:4:\"name\";s:13:\"BANDUNG BARAT\";}i:5;a:2:{s:2:\"id\";i:62;s:4:\"name\";s:7:\"CIANJUR\";}i:6;a:2:{s:2:\"id\";i:63;s:4:\"name\";s:6:\"BEKASI\";}i:7;a:2:{s:2:\"id\";i:77;s:4:\"name\";s:5:\"BOGOR\";}i:8;a:2:{s:2:\"id\";i:129;s:4:\"name\";s:7:\"CIREBON\";}i:9;a:2:{s:2:\"id\";i:131;s:4:\"name\";s:9:\"INDRAMAYU\";}i:10;a:2:{s:2:\"id\";i:132;s:4:\"name\";s:8:\"KUNINGAN\";}i:11;a:2:{s:2:\"id\";i:133;s:4:\"name\";s:10:\"MAJALENGKA\";}i:12;a:2:{s:2:\"id\";i:199;s:4:\"name\";s:5:\"DEPOK\";}i:13;a:2:{s:2:\"id\";i:329;s:4:\"name\";s:8:\"KARAWANG\";}i:14;a:2:{s:2:\"id\";i:532;s:4:\"name\";s:10:\"PURWAKARTA\";}i:15;a:2:{s:2:\"id\";i:533;s:4:\"name\";s:6:\"SUBANG\";}i:16;a:2:{s:2:\"id\";i:538;s:4:\"name\";s:8:\"SUKABUMI\";}i:17;a:2:{s:2:\"id\";i:632;s:4:\"name\";s:11:\"TASIKMALAYA\";}i:18;a:2:{s:2:\"id\";i:633;s:4:\"name\";s:6:\"BANJAR\";}i:19;a:2:{s:2:\"id\";i:634;s:4:\"name\";s:6:\"CIAMIS\";}i:20;a:2:{s:2:\"id\";i:635;s:4:\"name\";s:11:\"PANGANDARAN\";}}', 1767935669),
('rajaongkir:districts:139', 'a:10:{i:0;a:2:{s:2:\"id\";i:1354;s:4:\"name\";s:6:\"CAKUNG\";}i:1;a:2:{s:2:\"id\";i:1355;s:4:\"name\";s:8:\"CIPAYUNG\";}i:2;a:2:{s:2:\"id\";i:1356;s:4:\"name\";s:7:\"CIRACAS\";}i:3;a:2:{s:2:\"id\";i:1357;s:4:\"name\";s:11:\"DUREN SAWIT\";}i:4;a:2:{s:2:\"id\";i:1358;s:4:\"name\";s:10:\"JATINEGARA\";}i:5;a:2:{s:2:\"id\";i:1359;s:4:\"name\";s:11:\"KRAMAT JATI\";}i:6;a:2:{s:2:\"id\";i:1360;s:4:\"name\";s:7:\"MAKASAR\";}i:7;a:2:{s:2:\"id\";i:1361;s:4:\"name\";s:8:\"MATRAMAN\";}i:8;a:2:{s:2:\"id\";i:1362;s:4:\"name\";s:10:\"PASAR REBO\";}i:9;a:2:{s:2:\"id\";i:1363;s:4:\"name\";s:11:\"PULO GADUNG\";}}', 1767935638),
('rajaongkir:districts:63', 'a:35:{i:0;a:2:{s:2:\"id\";i:604;s:4:\"name\";s:13:\"BANTAR GEBANG\";}i:1;a:2:{s:2:\"id\";i:605;s:4:\"name\";s:12:\"BEKASI BARAT\";}i:2;a:2:{s:2:\"id\";i:606;s:4:\"name\";s:14:\"BEKASI SELATAN\";}i:3;a:2:{s:2:\"id\";i:607;s:4:\"name\";s:12:\"BEKASI TIMUR\";}i:4;a:2:{s:2:\"id\";i:608;s:4:\"name\";s:12:\"BEKASI UTARA\";}i:5;a:2:{s:2:\"id\";i:609;s:4:\"name\";s:8:\"JATIASIH\";}i:6;a:2:{s:2:\"id\";i:610;s:4:\"name\";s:13:\"JATI SAMPURNA\";}i:7;a:2:{s:2:\"id\";i:611;s:4:\"name\";s:12:\"MEDAN SATRIA\";}i:8;a:2:{s:2:\"id\";i:612;s:4:\"name\";s:12:\"MUSTIKA JAYA\";}i:9;a:2:{s:2:\"id\";i:613;s:4:\"name\";s:11:\"PONDOK GEDE\";}i:10;a:2:{s:2:\"id\";i:614;s:4:\"name\";s:13:\"PONDOK MELATI\";}i:11;a:2:{s:2:\"id\";i:615;s:4:\"name\";s:9:\"RAWALUMBU\";}i:12;a:2:{s:2:\"id\";i:616;s:4:\"name\";s:12:\"TAMBUN UTARA\";}i:13;a:2:{s:2:\"id\";i:617;s:4:\"name\";s:10:\"TARUMAJAYA\";}i:14;a:2:{s:2:\"id\";i:618;s:4:\"name\";s:7:\"BABELAN\";}i:15;a:2:{s:2:\"id\";i:1366;s:4:\"name\";s:14:\"CIKARANG BARAT\";}i:16;a:2:{s:2:\"id\";i:1367;s:4:\"name\";s:14:\"CIKARANG PUSAT\";}i:17;a:2:{s:2:\"id\";i:1368;s:4:\"name\";s:16:\"CIKARANG SELATAN\";}i:18;a:2:{s:2:\"id\";i:1369;s:4:\"name\";s:14:\"CIKARANG TIMUR\";}i:19;a:2:{s:2:\"id\";i:1370;s:4:\"name\";s:14:\"CIKARANG UTARA\";}i:20;a:2:{s:2:\"id\";i:1371;s:4:\"name\";s:12:\"CABANGBUNGIN\";}i:21;a:2:{s:2:\"id\";i:1372;s:4:\"name\";s:9:\"CIBARUSAH\";}i:22;a:2:{s:2:\"id\";i:1373;s:4:\"name\";s:8:\"CIBITUNG\";}i:23;a:2:{s:2:\"id\";i:1374;s:4:\"name\";s:15:\"KEDUNG WARINGIN\";}i:24;a:2:{s:2:\"id\";i:1375;s:4:\"name\";s:13:\"MUARA GEMBONG\";}i:25;a:2:{s:2:\"id\";i:1376;s:4:\"name\";s:9:\"PEBAYURAN\";}i:26;a:2:{s:2:\"id\";i:1377;s:4:\"name\";s:11:\"SERANG BARU\";}i:27;a:2:{s:2:\"id\";i:1378;s:4:\"name\";s:4:\"SETU\";}i:28;a:2:{s:2:\"id\";i:1379;s:4:\"name\";s:8:\"SUKATANI\";}i:29;a:2:{s:2:\"id\";i:1380;s:4:\"name\";s:9:\"TAMBELANG\";}i:30;a:2:{s:2:\"id\";i:1381;s:4:\"name\";s:13:\"KARANGBAHAGIA\";}i:31;a:2:{s:2:\"id\";i:1382;s:4:\"name\";s:9:\"SUKAKARYA\";}i:32;a:2:{s:2:\"id\";i:1383;s:4:\"name\";s:9:\"SUKAWANGI\";}i:33;a:2:{s:2:\"id\";i:1384;s:4:\"name\";s:11:\"BOJONGMANGU\";}i:34;a:2:{s:2:\"id\";i:1385;s:4:\"name\";s:14:\"TAMBUN SELATAN\";}}', 1767935672),
('rajaongkir:provinces', 'a:34:{i:0;a:2:{s:2:\"id\";i:1;s:4:\"name\";s:25:\"NUSA TENGGARA BARAT (NTB)\";}i:1;a:2:{s:2:\"id\";i:2;s:4:\"name\";s:6:\"MALUKU\";}i:2;a:2:{s:2:\"id\";i:3;s:4:\"name\";s:18:\"KALIMANTAN SELATAN\";}i:3;a:2:{s:2:\"id\";i:4;s:4:\"name\";s:17:\"KALIMANTAN TENGAH\";}i:4;a:2:{s:2:\"id\";i:5;s:4:\"name\";s:10:\"JAWA BARAT\";}i:5;a:2:{s:2:\"id\";i:6;s:4:\"name\";s:8:\"BENGKULU\";}i:6;a:2:{s:2:\"id\";i:7;s:4:\"name\";s:16:\"KALIMANTAN TIMUR\";}i:7;a:2:{s:2:\"id\";i:8;s:4:\"name\";s:14:\"KEPULAUAN RIAU\";}i:8;a:2:{s:2:\"id\";i:9;s:4:\"name\";s:30:\"NANGGROE ACEH DARUSSALAM (NAD)\";}i:9;a:2:{s:2:\"id\";i:10;s:4:\"name\";s:11:\"DKI JAKARTA\";}i:10;a:2:{s:2:\"id\";i:11;s:4:\"name\";s:6:\"BANTEN\";}i:11;a:2:{s:2:\"id\";i:12;s:4:\"name\";s:11:\"JAWA TENGAH\";}i:12;a:2:{s:2:\"id\";i:13;s:4:\"name\";s:5:\"JAMBI\";}i:13;a:2:{s:2:\"id\";i:14;s:4:\"name\";s:5:\"PAPUA\";}i:14;a:2:{s:2:\"id\";i:15;s:4:\"name\";s:4:\"BALI\";}i:15;a:2:{s:2:\"id\";i:16;s:4:\"name\";s:14:\"SUMATERA UTARA\";}i:16;a:2:{s:2:\"id\";i:17;s:4:\"name\";s:9:\"GORONTALO\";}i:17;a:2:{s:2:\"id\";i:18;s:4:\"name\";s:10:\"JAWA TIMUR\";}i:18;a:2:{s:2:\"id\";i:19;s:4:\"name\";s:13:\"DI YOGYAKARTA\";}i:19;a:2:{s:2:\"id\";i:20;s:4:\"name\";s:17:\"SULAWESI TENGGARA\";}i:20;a:2:{s:2:\"id\";i:21;s:4:\"name\";s:25:\"NUSA TENGGARA TIMUR (NTT)\";}i:21;a:2:{s:2:\"id\";i:22;s:4:\"name\";s:14:\"SULAWESI UTARA\";}i:22;a:2:{s:2:\"id\";i:23;s:4:\"name\";s:14:\"SUMATERA BARAT\";}i:23;a:2:{s:2:\"id\";i:24;s:4:\"name\";s:15:\"BANGKA BELITUNG\";}i:24;a:2:{s:2:\"id\";i:25;s:4:\"name\";s:4:\"RIAU\";}i:25;a:2:{s:2:\"id\";i:26;s:4:\"name\";s:16:\"SUMATERA SELATAN\";}i:26;a:2:{s:2:\"id\";i:27;s:4:\"name\";s:15:\"SULAWESI TENGAH\";}i:27;a:2:{s:2:\"id\";i:28;s:4:\"name\";s:16:\"KALIMANTAN BARAT\";}i:28;a:2:{s:2:\"id\";i:29;s:4:\"name\";s:11:\"PAPUA BARAT\";}i:29;a:2:{s:2:\"id\";i:30;s:4:\"name\";s:7:\"LAMPUNG\";}i:30;a:2:{s:2:\"id\";i:31;s:4:\"name\";s:16:\"KALIMANTAN UTARA\";}i:31;a:2:{s:2:\"id\";i:32;s:4:\"name\";s:12:\"MALUKU UTARA\";}i:32;a:2:{s:2:\"id\";i:33;s:4:\"name\";s:16:\"SULAWESI SELATAN\";}i:33;a:2:{s:2:\"id\";i:34;s:4:\"name\";s:14:\"SULAWESI BARAT\";}}', 1767935541),
('rajaongkir:subdistricts:1363', 'a:7:{i:0;a:3:{s:2:\"id\";i:17731;s:4:\"name\";s:8:\"CIPINANG\";s:8:\"zip_code\";s:5:\"13240\";}i:1;a:3:{s:2:\"id\";i:17732;s:4:\"name\";s:4:\"JATI\";s:8:\"zip_code\";s:5:\"13220\";}i:2;a:3:{s:2:\"id\";i:17733;s:4:\"name\";s:15:\"JATINEGARA KAUM\";s:8:\"zip_code\";s:5:\"13250\";}i:3;a:3:{s:2:\"id\";i:17734;s:4:\"name\";s:10:\"KAYU PUTIH\";s:8:\"zip_code\";s:5:\"13210\";}i:4;a:3:{s:2:\"id\";i:17735;s:4:\"name\";s:14:\"PISANGAN TIMUR\";s:8:\"zip_code\";s:5:\"13230\";}i:5;a:3:{s:2:\"id\";i:17736;s:4:\"name\";s:11:\"PULO GADUNG\";s:8:\"zip_code\";s:5:\"13260\";}i:6;a:3:{s:2:\"id\";i:17737;s:4:\"name\";s:10:\"RAWAMANGUN\";s:8:\"zip_code\";s:5:\"13220\";}}', 1767935642),
('rajaongkir:subdistricts:608', 'a:6:{i:0;a:3:{s:2:\"id\";i:6535;s:4:\"name\";s:12:\"HARAPAN BARU\";s:8:\"zip_code\";s:5:\"17123\";}i:1;a:3:{s:2:\"id\";i:6536;s:4:\"name\";s:12:\"HARAPAN JAYA\";s:8:\"zip_code\";s:5:\"17124\";}i:2;a:3:{s:2:\"id\";i:6537;s:4:\"name\";s:17:\"KALI ABANG TENGAH\";s:8:\"zip_code\";s:5:\"17125\";}i:3;a:3:{s:2:\"id\";i:6538;s:4:\"name\";s:11:\"MARGA MULYA\";s:8:\"zip_code\";s:5:\"17142\";}i:4;a:3:{s:2:\"id\";i:6539;s:4:\"name\";s:7:\"PERWIRA\";s:8:\"zip_code\";s:5:\"17122\";}i:5;a:3:{s:2:\"id\";i:6540;s:4:\"name\";s:12:\"TELUK PUCUNG\";s:8:\"zip_code\";s:5:\"17121\";}}', 1767935676);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `harga_tingkat`
--

CREATE TABLE `harga_tingkat` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `min_jumlah` int(10) UNSIGNED NOT NULL,
  `max_jumlah` int(10) UNSIGNED DEFAULT NULL,
  `harga_total` decimal(12,2) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `harga_tingkat`
--

INSERT INTO `harga_tingkat` (`id`, `product_id`, `min_jumlah`, `max_jumlah`, `harga_total`, `label`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, 2, 250000.00, '1 Botol', '2026-01-08 10:02:24', '2026-01-08 10:02:24'),
(2, NULL, 3, 4, 700000.00, '3 Botol', '2026-01-08 10:02:24', '2026-01-08 10:02:24'),
(3, NULL, 5, 9, 1100000.00, '5 Botol', '2026-01-08 10:02:24', '2026-01-08 10:02:24'),
(4, NULL, 10, NULL, 2000000.00, '10+ Botol', '2026-01-08 10:02:24', '2026-01-08 10:02:24');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nama_kategori` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id`, `nama_kategori`, `created_at`, `updated_at`) VALUES
(1, 'Propolis', '2026-01-08 10:02:24', '2026-01-08 10:02:24'),
(2, 'Perawatan', '2026-01-08 10:02:24', '2026-01-08 10:02:24'),
(3, 'Bundling', '2026-01-08 10:02:24', '2026-01-08 10:02:24');

-- --------------------------------------------------------

--
-- Table structure for table `keranjang`
--

CREATE TABLE `keranjang` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_variant_pack_id` bigint(20) UNSIGNED DEFAULT NULL,
  `jumlah` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `keranjang`
--

INSERT INTO `keranjang` (`id`, `user_id`, `product_id`, `product_variant_id`, `product_variant_pack_id`, `jumlah`, `created_at`, `updated_at`) VALUES
(7, 2, 6, 6, NULL, 1, '2026-01-08 10:26:11', '2026-01-08 10:26:11');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_11_17_143934_create_personal_access_tokens_table', 1),
(5, '2025_11_17_144018_create_categories_table', 1),
(6, '2025_11_17_144025_create_products_table', 1),
(7, '2025_11_17_144029_create_harga_tingkat_table', 1),
(8, '2025_11_17_144034_create_keranjang_table', 1),
(9, '2025_11_17_144037_create_product_batches_table', 1),
(10, '2025_11_17_144041_create_batch_stock_movements_table', 1),
(11, '2025_11_17_144049_create_orders_table', 1),
(12, '2025_11_17_144053_create_order_items_table', 1),
(13, '2025_11_17_144056_create_order_item_batches_table', 1),
(14, '2025_11_17_144103_create_addresses_table', 1),
(15, '2025_11_18_051447_add_berat_to_products_table', 1),
(16, '2025_11_18_065005_add_manual_fields_to_orders_table', 1),
(17, '2025_11_18_083244_add_metrics_to_orders_table', 1),
(18, '2025_11_18_100612_add_destination_details_to_orders_table', 1),
(19, '2025_11_18_101530_drop_origin_city_id_from_orders_table', 1),
(20, '2025_11_18_120000_add_tracking_columns_to_orders_table', 1),
(21, '2025_11_19_000001_create_order_item_product_codes_table', 1),
(22, '2025_11_19_041607_modify_harga_tingkat_table_make_product_id_nullable', 1),
(23, '2025_11_19_174938_update_products_gambar_to_json', 1),
(24, '2025_11_20_000200_drop_batch_tables_and_update_products_table', 1),
(25, '2025_11_20_025031_remove_reseller_from_users_role_enum', 1),
(26, '2025_11_20_031714_remove_redundant_columns_from_orders_table', 1),
(27, '2025_11_20_094642_create_stock_movements_table', 1),
(28, '2025_11_21_152025_add_tipe_to_products_table', 1),
(29, '2025_11_21_152311_create_product_variants_table', 1),
(30, '2025_11_21_154548_create_product_variant_packs_table', 1),
(31, '2025_11_22_023907_add_variant_columns_to_cart_and_orders', 1),
(32, '2025_11_22_025645_remove_harga_tingkat_from_cart_and_orders', 1),
(33, '2025_11_22_054838_modify_product_variant_packs_to_support_direct_product_packs', 1),
(34, '2025_11_22_061342_make_sku_nullable_in_products_table', 1),
(35, '2025_11_22_082235_add_variant_columns_to_stock_movements_table', 1),
(36, '2025_11_23_053203_add_indexes_to_stock_movements_table', 1),
(37, '2025_11_23_054313_add_indexes_to_orders_table', 1),
(38, '2025_11_23_061057_add_address_ids_to_users_table', 1),
(39, '2025_11_23_061759_drop_addresses_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `ongkos_kirim` decimal(12,2) DEFAULT NULL,
  `total` decimal(12,2) NOT NULL,
  `courier` varchar(50) DEFAULT NULL,
  `courier_service` varchar(50) DEFAULT NULL,
  `destination_province_id` int(10) UNSIGNED DEFAULT NULL,
  `destination_province_name` varchar(255) DEFAULT NULL,
  `destination_city_id` int(10) UNSIGNED DEFAULT NULL,
  `destination_city_name` varchar(255) DEFAULT NULL,
  `destination_district_id` int(10) UNSIGNED DEFAULT NULL,
  `destination_district_name` varchar(255) DEFAULT NULL,
  `destination_subdistrict_id` int(10) UNSIGNED DEFAULT NULL,
  `destination_subdistrict_name` varchar(255) DEFAULT NULL,
  `destination_postal_code` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('belum_dibayar','menunggu_konfirmasi','diproses','dikirim','selesai','dibatalkan','expired') NOT NULL DEFAULT 'belum_dibayar',
  `channel` varchar(50) NOT NULL DEFAULT 'online',
  `external_order_id` varchar(100) DEFAULT NULL,
  `metode_pembayaran` enum('BCA','BSI','gopay','dana','transfer_manual') DEFAULT NULL,
  `bukti_pembayaran` varchar(255) DEFAULT NULL,
  `resi` varchar(100) DEFAULT NULL,
  `tracking_status` varchar(100) DEFAULT NULL,
  `tracking_payload` longtext DEFAULT NULL,
  `tracking_last_checked_at` timestamp NULL DEFAULT NULL,
  `tracking_completed_at` timestamp NULL DEFAULT NULL,
  `reservation_expires_at` timestamp NULL DEFAULT NULL,
  `ordered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_variant_pack_id` bigint(20) UNSIGNED DEFAULT NULL,
  `harga_satuan` decimal(12,2) NOT NULL,
  `jumlah` int(10) UNSIGNED NOT NULL,
  `total_harga` decimal(12,2) NOT NULL,
  `catatan` varchar(100) DEFAULT NULL,
  `allocated` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_item_product_codes`
--

CREATE TABLE `order_item_product_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_item_id` bigint(20) UNSIGNED NOT NULL,
  `kode_produk` varchar(100) NOT NULL,
  `sequence` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(3, 'App\\Models\\User', 2, 'auth_token', '04dd73b66a7c784509e3b61b22345eb9172beda62c3761e44665edaceebadc42', '[\"*\"]', '2026-01-08 10:27:45', NULL, '2026-01-08 10:14:13', '2026-01-08 10:27:45'),
(5, 'App\\Models\\User', 1, 'auth_token', '06f733492fa0ba631743ce7ee26784c461273c1b92c2ff9902e68b74666ebc8e', '[\"*\"]', '2026-01-08 10:24:26', NULL, '2026-01-08 10:17:26', '2026-01-08 10:24:26'),
(6, 'App\\Models\\User', 3, 'auth_token', '9dd05a57c342d228d36d0ce01b505fe55a13049d9cbc4985a9042b7bee04faf1', '[\"*\"]', '2026-01-08 10:52:46', NULL, '2026-01-08 10:20:40', '2026-01-08 10:52:46');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `kategori_id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `nama_produk` varchar(255) NOT NULL,
  `tipe` varchar(255) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga_ecer` decimal(10,2) NOT NULL,
  `stok` int(11) NOT NULL DEFAULT 0,
  `stok_reserved` int(11) NOT NULL DEFAULT 0,
  `gambar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gambar`)),
  `berat` int(11) NOT NULL DEFAULT 500 COMMENT 'Berat produk dalam gram',
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `kategori_id`, `sku`, `nama_produk`, `tipe`, `deskripsi`, `harga_ecer`, `stok`, `stok_reserved`, `gambar`, `berat`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'PRP-001', 'Propolis 10ml', NULL, 'Produk sampel untuk pengujian backend.', 250000.00, 100, 0, NULL, 500, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:17:35', '2026-01-08 10:17:35'),
(2, 2, 'PRP-002', 'Propolis 20ml', NULL, 'Produk sampel untuk pengujian backend.', 250000.00, 100, 0, NULL, 500, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:17:38', '2026-01-08 10:17:38'),
(3, 3, 'PRP-003', 'Face Serum', NULL, 'Produk sampel untuk pengujian backend.', 250000.00, 100, 0, NULL, 500, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:17:41', '2026-01-08 10:17:41'),
(4, 1, 'PRP-004', 'Bundling Hemat', NULL, 'Produk sampel untuk pengujian backend.', 250000.00, 100, 0, NULL, 500, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:17:46', '2026-01-08 10:17:46'),
(5, 2, 'PRP-005', 'Honey Boost', NULL, 'Produk sampel untuk pengujian backend.', 250000.00, 100, 0, NULL, 500, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:17:52', '2026-01-08 10:17:52'),
(6, 1, 'PROD-01', 'British Propolis', NULL, 'ini contoh', 250000.00, 0, 0, '[\"https:\\/\\/api-propolis.ugtix.my.id\\/storage\\/products\\/1767892768_695fe720d4b3f_45e26f541057b7c0f0ac50be46ae8db1.png\"]', 100, 'aktif', '2026-01-08 10:19:28', '2026-01-08 10:19:28', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `tipe` varchar(255) NOT NULL,
  `sku_variant` varchar(255) DEFAULT NULL,
  `stok` int(11) NOT NULL DEFAULT 0,
  `stok_reserved` int(11) NOT NULL DEFAULT 0,
  `harga_ecer` decimal(10,2) DEFAULT NULL,
  `gambar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gambar`)),
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `tipe`, `sku_variant`, `stok`, `stok_reserved`, `harga_ecer`, `gambar`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'BP REGULER (dewasa)', 'PRP-001-BP-REGULER-DEWASA', 100, 0, NULL, NULL, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(2, 1, 'BP KIDS (anak)', 'PRP-001-BP-KIDS-ANAK', 100, 0, NULL, NULL, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(3, 1, 'BP BLUE for woman', 'PRP-001-BP-BLUE-FOR-WOMAN', 100, 0, NULL, NULL, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(4, 2, 'BP REGULER (dewasa)', 'PRP-002-BP-REGULER-DEWASA', 100, 0, NULL, NULL, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(5, 2, 'BP KIDS (anak)', 'PRP-002-BP-KIDS-ANAK', 100, 0, NULL, NULL, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(6, 6, 'BP REGULER', 'BP-REG', 100, 0, NULL, NULL, 'aktif', '2026-01-08 10:19:33', '2026-01-08 10:19:33', NULL),
(7, 6, 'BP KIDS', 'BP-KIDS-01', 50, 0, NULL, NULL, 'aktif', '2026-01-08 10:19:35', '2026-01-08 10:19:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_variant_packs`
--

CREATE TABLE `product_variant_packs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `pack_size` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `sku_pack` varchar(255) DEFAULT NULL,
  `harga_pack` decimal(12,2) DEFAULT NULL,
  `stok` int(11) NOT NULL DEFAULT 0,
  `stok_reserved` int(11) NOT NULL DEFAULT 0,
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `product_variant_packs`
--

INSERT INTO `product_variant_packs` (`id`, `product_id`, `product_variant_id`, `label`, `pack_size`, `sku_pack`, `harga_pack`, `stok`, `stok_reserved`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, 1, '1 Botol', 1, NULL, 250000.00, 50, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(2, NULL, 1, '3 Botol', 3, NULL, 700000.00, 30, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(3, NULL, 1, '5 Botol', 5, NULL, 1100000.00, 20, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(4, NULL, 2, '1 Botol', 1, NULL, 250000.00, 50, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(5, NULL, 2, '3 Botol', 3, NULL, 700000.00, 30, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(6, NULL, 2, '5 Botol', 5, NULL, 1100000.00, 20, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(7, NULL, 3, '1 Botol', 1, NULL, 250000.00, 50, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(8, NULL, 3, '3 Botol', 3, NULL, 700000.00, 30, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(9, NULL, 3, '5 Botol', 5, NULL, 1100000.00, 20, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(10, NULL, 4, '1 Botol', 1, NULL, 250000.00, 50, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(11, NULL, 4, '3 Botol', 3, NULL, 700000.00, 30, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(12, NULL, 4, '5 Botol', 5, NULL, 1100000.00, 20, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(13, NULL, 5, '1 Botol', 1, NULL, 250000.00, 50, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(14, NULL, 5, '3 Botol', 3, NULL, 700000.00, 30, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(15, NULL, 5, '5 Botol', 5, NULL, 1100000.00, 20, 0, 'aktif', '2026-01-08 10:02:24', '2026-01-08 10:02:24', NULL),
(16, NULL, 7, '1 Botol', 1, NULL, 250000.00, 0, 0, 'aktif', '2026-01-08 10:21:41', '2026-01-08 10:21:41', NULL),
(17, NULL, 7, '3 Botol', 3, NULL, 650000.00, 0, 0, 'aktif', '2026-01-08 10:23:42', '2026-01-08 10:23:42', NULL),
(18, NULL, 7, '5 Botol', 5, NULL, 1000000.00, 0, 0, 'aktif', '2026-01-08 10:24:23', '2026-01-08 10:24:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('0s3U679Y5FoMe0YuCwVwxApOhbdOYTRHDZGpOjMJ', NULL, '3.92.138.53', 'axios/1.13.2', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVzV1M1paWEJaa1ZEaWN4dTc4aWpPZU5xaXI3ZXV4MWppQVpBZnN3MyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly93d3cuYXBpLXByb3BvbGlzLnVndGl4Lm15LmlkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767892147),
('5Rc25V9u88HzUhnh4Pu7uZq3FCQXFDLqcmpIunDu', NULL, '3.92.138.53', 'axios/1.13.2', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRjVUZnF5Mkdyd2JJOVlkUXJ0SFo3NXdFOEtHcmJab25hTGFmTlJIWCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly9hcGktcHJvcG9saXMudWd0aXgubXkuaWQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767892146),
('HEw5AimkumpnOTj7K0Hwq8t2H5qtkz1jFb5i05V6', NULL, '91.231.89.39', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibzg0YmdEQWJvSk1RY1lzTm11NEhjT1haRFNCZjBSY0dzY1BTM2I5NCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly9hcGktcHJvcG9saXMudWd0aXgubXkuaWQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767892485),
('iu9OxHajWKjMzqxVC0abYSar8UcVVFfXj3vL8Rxl', NULL, '110.138.87.128', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoid1lldlAyMHg2QkVTQThLcjhKU3BkZkVxN0RIRWY5NlQ4ZWNwSDNhZiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzI6Imh0dHBzOi8vYXBpLXByb3BvbGlzLnVndGl4Lm15LmlkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767892352),
('j9Gju1sWsKxzdxpvndAZK5eRsc1tnzO8kTsL80tf', NULL, '3.87.98.118', 'axios/1.13.2', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibGtsUmNybUFyUmR2V3JrY09BcWphaGUxNFRoMWNUYU5lNU82VHB0QSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly9hcGktcHJvcG9saXMudWd0aXgubXkuaWQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767894091),
('jMLL0bjLivUShZ7L614WFyeyyhpKoBtvEf8HyFVU', NULL, '3.87.98.118', 'axios/1.13.2', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMDFjNXVJQTQyUGZ1ekdqYnhneE1MOEM1d1VsNmg3aGEzRElwaW02byI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly93d3cuYXBpLXByb3BvbGlzLnVndGl4Lm15LmlkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767894091),
('jX8lYzsyQeO0NQ59gAwTTMZ8DBvABvKR7IVOta3J', NULL, '91.231.89.122', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidEhKMkxQejB3aGZHeXo4NjFabTZRRzc4RGJlTzlycmJjSnV1cEd0dSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly9hcGktcHJvcG9saXMudWd0aXgubXkuaWQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767892390),
('M14UlMdJFWmD77VVmiESDPSM7CzEOEKfvDrqGEOm', NULL, '167.94.138.161', 'Mozilla/5.0 (compatible; CensysInspect/1.1; +https://about.censys.io/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNzZMV3lwT1MwbmdNa0JyM09udnd6WU1CZ1NvZVYwTTBTNXlRa2ZHQyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly9hcGktcHJvcG9saXMudWd0aXgubXkuaWQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767894044),
('oeF23NlakjxPcpuqvsZIowzRR8OMjG0pt9iBTn2o', NULL, '91.231.89.125', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYkp0dk1uME9oQmpucW5FaU9rbnJqYTdEcFNEMjRzUXpCY2U0cXkzciI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly93d3cuYXBpLXByb3BvbGlzLnVndGl4Lm15LmlkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767892898),
('svdP1r7mnPYcm5MYU2RUCdY5PGyrlJIa7FBMM0B0', NULL, '91.231.89.33', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQlF0TkRMMTlhMTZsQjlCTTJoTm5vbnROSkFMUHBoQmJiUExNS29TWCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly93d3cuYXBpLXByb3BvbGlzLnVndGl4Lm15LmlkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767892963);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_variant_pack_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `change_qty` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `reference_type` varchar(255) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `product_variant_id`, `product_variant_pack_id`, `order_id`, `user_id`, `change_qty`, `type`, `reference_type`, `reference_id`, `note`, `created_at`, `updated_at`) VALUES
(1, 6, NULL, NULL, NULL, 1, 100, 'initial_stock', 'product_variants', 6, 'Stok awal varian: BP REGULER', '2026-01-08 10:19:33', '2026-01-08 10:19:33'),
(2, 6, NULL, NULL, NULL, 1, 50, 'initial_stock', 'product_variants', 7, 'Stok awal varian: BP KIDS', '2026-01-08 10:19:35', '2026-01-08 10:19:35');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `role` enum('admin','pelanggan') NOT NULL DEFAULT 'pelanggan',
  `province_id` int(10) UNSIGNED DEFAULT NULL,
  `provinsi` varchar(255) DEFAULT NULL,
  `city_id` int(10) UNSIGNED DEFAULT NULL,
  `kabupaten_kota` varchar(255) DEFAULT NULL,
  `district_id` int(10) UNSIGNED DEFAULT NULL,
  `kecamatan` varchar(255) DEFAULT NULL,
  `subdistrict_id` int(10) UNSIGNED DEFAULT NULL,
  `kelurahan` varchar(255) DEFAULT NULL,
  `kode_pos` varchar(10) DEFAULT NULL,
  `alamat_lengkap` text DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama_lengkap`, `username`, `email`, `email_verified_at`, `password`, `no_hp`, `role`, `province_id`, `provinsi`, `city_id`, `kabupaten_kota`, `district_id`, `kecamatan`, `subdistrict_id`, `kelurahan`, `kode_pos`, `alamat_lengkap`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin', 'admin@example.com', NULL, '$2y$12$k3SiU.cFMlq1A8RazCumNu4.fBA8SqAulHZ/o3.uTCxLs4Qqh1aRW', '628123456789', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jl. Propolis No. 1 Jakarta', NULL, '2026-01-08 10:02:24', '2026-01-08 10:02:24'),
(2, 'Mifta Rizaldirahmat', 'mifta', 'mifta99jkt@gmail.com', NULL, '$2y$12$VEPXPx1ncZ98uPCnlbyr.eDVemzvJ2RcdxG2sYhbXHPP1NAZjQrhq', '081247952575', 'pelanggan', 10, 'DKI JAKARTA', 139, 'JAKARTA TIMUR', 1363, 'PULO GADUNG', 17737, 'RAWAMANGUN', '13220', 'Jl. Pemuda Asli 1, RT.01/RW.03, No. 19, Rawamangun, Pulogadung, Jakarta Timur., Jl. Pemuda Asli 1, RT.01/RW.03, No. 19, Rawamangun, Pulogadung, Jakarta Timur.\nPulogadung', NULL, '2026-01-08 10:14:07', '2026-01-08 10:14:07'),
(3, 'Muhammad Ammar Arief', 'mnmararief', 'ammararief321@gmail.com', NULL, '$2y$12$Key7u0NzJ5Vcs6NmLt9Bo.5PEyD342lD./uUSYeT9dpN4h7RIBtfe', '08872588744', 'pelanggan', 5, 'JAWA BARAT', 63, 'BEKASI', 608, 'BEKASI UTARA', 6535, 'HARAPAN BARU', '17123', 'Prima Harapan Regency Blok C5/10', NULL, '2026-01-08 10:15:20', '2026-01-08 10:15:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `harga_tingkat`
--
ALTER TABLE `harga_tingkat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `harga_tingkat_product_id_foreign` (`product_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kategori_nama_kategori_unique` (`nama_kategori`);

--
-- Indexes for table `keranjang`
--
ALTER TABLE `keranjang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `keranjang_unique_variant` (`user_id`,`product_id`,`product_variant_id`,`product_variant_pack_id`),
  ADD KEY `keranjang_product_id_foreign` (`product_id`),
  ADD KEY `keranjang_product_variant_id_foreign` (`product_variant_id`),
  ADD KEY `keranjang_product_variant_pack_id_foreign` (`product_variant_pack_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_user_id_status_index` (`user_id`,`status`),
  ADD KEY `orders_reservation_expires_at_index` (`reservation_expires_at`),
  ADD KEY `orders_channel_index` (`channel`),
  ADD KEY `orders_external_order_id_index` (`external_order_id`),
  ADD KEY `orders_ordered_at_index` (`ordered_at`),
  ADD KEY `orders_ordered_at_status_index` (`ordered_at`,`status`),
  ADD KEY `orders_created_at_index` (`created_at`),
  ADD KEY `orders_status_index` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`),
  ADD KEY `order_items_product_variant_id_foreign` (`product_variant_id`),
  ADD KEY `order_items_product_variant_pack_id_foreign` (`product_variant_pack_id`);

--
-- Indexes for table `order_item_product_codes`
--
ALTER TABLE `order_item_product_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_item_product_codes_kode_produk_unique` (`kode_produk`),
  ADD UNIQUE KEY `order_item_sequence_unique` (`order_item_id`,`sequence`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD KEY `products_kategori_id_foreign` (`kategori_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_variants_sku_variant_unique` (`sku_variant`),
  ADD KEY `product_variants_product_id_tipe_index` (`product_id`,`tipe`),
  ADD KEY `product_variants_status_index` (`status`);

--
-- Indexes for table `product_variant_packs`
--
ALTER TABLE `product_variant_packs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_variant_packs_sku_pack_unique` (`sku_pack`),
  ADD KEY `product_variant_packs_status_index` (`status`),
  ADD KEY `product_variant_packs_product_id_pack_size_index` (`product_id`,`pack_size`),
  ADD KEY `product_variant_packs_product_variant_id_pack_size_index` (`product_variant_id`,`pack_size`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_user_id_foreign` (`user_id`),
  ADD KEY `stock_movements_product_id_created_at_index` (`product_id`,`created_at`),
  ADD KEY `stock_movements_type_created_at_index` (`type`,`created_at`),
  ADD KEY `stock_movements_order_id_created_at_index` (`order_id`,`created_at`),
  ADD KEY `stock_movements_product_variant_pack_id_foreign` (`product_variant_pack_id`),
  ADD KEY `stock_movements_product_variant_id_created_at_index` (`product_variant_id`,`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `harga_tingkat`
--
ALTER TABLE `harga_tingkat`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `keranjang`
--
ALTER TABLE `keranjang`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_item_product_codes`
--
ALTER TABLE `order_item_product_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_variant_packs`
--
ALTER TABLE `product_variant_packs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `harga_tingkat`
--
ALTER TABLE `harga_tingkat`
  ADD CONSTRAINT `harga_tingkat_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `keranjang`
--
ALTER TABLE `keranjang`
  ADD CONSTRAINT `keranjang_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `keranjang_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `keranjang_product_variant_pack_id_foreign` FOREIGN KEY (`product_variant_pack_id`) REFERENCES `product_variant_packs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `keranjang_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `order_items_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `order_items_product_variant_pack_id_foreign` FOREIGN KEY (`product_variant_pack_id`) REFERENCES `product_variant_packs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_item_product_codes`
--
ALTER TABLE `order_item_product_codes`
  ADD CONSTRAINT `order_item_product_codes_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_kategori_id_foreign` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`);

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variant_packs`
--
ALTER TABLE `product_variant_packs`
  ADD CONSTRAINT `product_variant_packs_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variant_packs_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_product_variant_pack_id_foreign` FOREIGN KEY (`product_variant_pack_id`) REFERENCES `product_variant_packs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
