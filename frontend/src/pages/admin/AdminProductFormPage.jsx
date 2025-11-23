import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { getProductImageUrl } from '../../utils/imageHelper';

const initialForm = {
  kategori_id: '',
  sku: '',
  nama_produk: '',
  harga_ecer: '',
  stok: '0',
  status: 'aktif',
  deskripsi: '',
  berat: '500',
  gambar_file: null,
};

const AdminProductFormPage = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const [savedProductId, setSavedProductId] = useState(urlId || null);
  const id = savedProductId || urlId;
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [hasVariants, setHasVariants] = useState(false); // Toggle: produk punya variant atau tidak
  const [hasPacks, setHasPacks] = useState(false); // Toggle: produk tanpa variant tapi mau buat pack
  const [variants, setVariants] = useState([]);
  const [pendingVariants, setPendingVariants] = useState([]); // Variant yang dibuat sebelum produk disimpan
  const [productPacks, setProductPacks] = useState([]); // Pack langsung dari produk (tanpa variant)
  const [pendingPacks, setPendingPacks] = useState([]); // Pack yang dibuat sebelum produk disimpan
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({
    tipe: '',
    sku_variant: '',
    stok: '0',
    harga_ecer: '',
    status: 'aktif',
  });
  const [packForms, setPackForms] = useState({});
  const [showPackFormFor, setShowPackFormFor] = useState(null);
  const [editingPack, setEditingPack] = useState(null);
  const [showProductPackForm, setShowProductPackForm] = useState(false);
  const [productPackForm, setProductPackForm] = useState({ label: '', pack_size: '1', harga_pack: '', status: 'aktif' });
  const [editingProductPack, setEditingProductPack] = useState(null);
  const [isVariantsSectionOpen, setIsVariantsSectionOpen] = useState(true); // Collapsible section
  const [isPacksSectionOpen, setIsPacksSectionOpen] = useState(true); // Collapsible section
  const defaultPackForm = { label: '', pack_size: '1', harga_pack: '', status: 'aktif' };
  const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data?.data ?? data.data ?? []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      const product = data.data;
      setForm({
        kategori_id: product.kategori_id || '',
        sku: product.sku || '',
        nama_produk: product.nama_produk || '',
        harga_ecer: product.harga_ecer || '',
        stok: product.stok?.toString() || '0',
        status: product.status || 'aktif',
        deskripsi: product.deskripsi || '',
        berat: product.berat?.toString() || '500',
      });
      const productImages = Array.isArray(product.gambar) 
        ? product.gambar 
        : (product.gambar ? [product.gambar] : []);
      setExistingImages(productImages.map(img => getProductImageUrl(img)));
      setImageFiles([]);
      setImagesToDelete([]);
      
      // Helper function untuk fetch product packs
      const fetchProductPacksHelper = async () => {
        if (!id) return [];
        try {
          const { data: packsData } = await api.get(`/admin/products/${id}/packs`);
          const packs = packsData.data || [];
          setProductPacks(packs);
          return packs;
        } catch (err) {
          // Jika produk punya variant, endpoint ini akan return error, itu normal
          if (err.response?.status !== 422) {
            console.error('Failed to fetch product packs:', err);
          }
          setProductPacks([]);
          return [];
        }
      };
      
      // Fetch variants
      let productHasVariants = false;
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
        productHasVariants = true;
        setHasVariants(true);
      } else {
        // Try to fetch variants from API
        try {
          const { data: variantsData } = await api.get(`/admin/products/${id}/variants`);
          setVariants(variantsData.data || []);
          if (variantsData.data && variantsData.data.length > 0) {
            productHasVariants = true;
            setHasVariants(true);
          } else {
            setHasVariants(false);
          }
        } catch (err) {
          console.error('Failed to fetch variants:', err);
          setVariants([]);
          setHasVariants(false);
        }
      }
      
      // Fetch packs langsung dari produk jika ada
      if (product.packs && product.packs.length > 0) {
        setProductPacks(product.packs);
        setHasPacks(true);
      } else if (!productHasVariants) {
        // Hanya fetch packs jika produk tidak punya variant
        const packsData = await fetchProductPacksHelper();
        if (packsData && packsData.length > 0) {
          setHasPacks(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat produk');
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [fetchCategories, fetchProduct, isEdit]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
    }
    // Reset input
    e.target.value = '';
  };

  const removeImageFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };

  // Variant Management Functions
  const fetchVariants = async (productId = null) => {
    const targetId = productId || id;
    if (!targetId) return;
    try {
      const { data } = await api.get(`/admin/products/${targetId}/variants`);
      setVariants(data.data || []);
    } catch (err) {
      console.error('Failed to fetch variants:', err);
      setVariants([]);
    }
  };

  // Product Pack Management Functions (pack langsung dari produk, tanpa variant)
  const fetchProductPacks = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/admin/products/${id}/packs`);
      setProductPacks(data.data || []);
    } catch (err) {
      // Jika produk punya variant, endpoint ini akan return error, itu normal
      if (err.response?.status !== 422) {
        console.error('Failed to fetch product packs:', err);
      }
      setProductPacks([]);
    }
  };

  const handleAddVariant = async () => {
    if (!variantForm.tipe.trim()) {
      setError('Tipe varian harus diisi');
      return;
    }
    
    // Jika produk belum disimpan, tambahkan ke pending variants
    if (!id) {
      const tempId = generateId();
      setPendingVariants(prev => [...prev, {
        ...variantForm,
        tempId,
        stok: variantForm.stok || '0',
      }]);
      setVariantForm({ tipe: '', sku_variant: '', stok: '0', harga_ecer: '', status: 'aktif' });
      setShowVariantForm(false);
      setMessage('Varian akan dibuat setelah produk disimpan');
      return;
    }

    // Jika produk sudah disimpan, langsung simpan ke backend
    try {
      const formData = new FormData();
      formData.append('tipe', variantForm.tipe);
      if (variantForm.sku_variant) {
        formData.append('sku_variant', variantForm.sku_variant);
      }
      formData.append('stok', variantForm.stok || '0');
      if (variantForm.harga_ecer) {
        formData.append('harga_ecer', variantForm.harga_ecer);
      }
      formData.append('status', variantForm.status);

      await api.post(`/admin/products/${id}/variants`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Varian berhasil ditambahkan');
      setVariantForm({ tipe: '', sku_variant: '', stok: '0', harga_ecer: '', status: 'aktif' });
      setShowVariantForm(false);
      await fetchVariants();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah varian');
    }
  };

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 9);
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    setVariantForm({
      tipe: variant.tipe || '',
      sku_variant: variant.sku_variant || '',
      stok: variant.stok?.toString() || '0',
      harga_ecer: variant.harga_ecer?.toString() || '',
      status: variant.status || 'aktif',
    });
    setShowVariantForm(true);
  };

  const handleUpdateVariant = async () => {
    if (!editingVariant || !id) return;

    try {
      const formData = new FormData();
      formData.append('tipe', variantForm.tipe);
      if (variantForm.sku_variant) {
        formData.append('sku_variant', variantForm.sku_variant);
      }
      formData.append('stok', variantForm.stok || '0');
      if (variantForm.harga_ecer) {
        formData.append('harga_ecer', variantForm.harga_ecer);
      } else {
        formData.append('harga_ecer', '');
      }
      formData.append('status', variantForm.status);

      await api.put(`/admin/products/${id}/variants/${editingVariant.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Varian berhasil diperbarui');
      setVariantForm({ tipe: '', sku_variant: '', stok: '0', harga_ecer: '', status: 'aktif' });
      setEditingVariant(null);
      setShowVariantForm(false);
      await fetchVariants();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui varian');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Yakin ingin menghapus varian ini?')) return;
    
    // Jika variant adalah pending variant (belum ada id)
    if (variantId.toString().startsWith('temp-') || !variantId.toString().match(/^\d+$/)) {
      setPendingVariants(prev => prev.filter(v => v.tempId !== variantId));
      return;
    }
    
    if (!id) return;

    try {
      await api.delete(`/admin/products/${id}/variants/${variantId}`);
      setMessage('Varian berhasil dihapus');
      await fetchVariants();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus varian');
    }
  };

  const handleAddStockVariant = async (variantId, qty) => {
    if (!id) return;

    try {
      await api.post(`/admin/products/${id}/variants/${variantId}/add-stock`, { qty });
      setMessage('Stok varian berhasil ditambahkan');
      await fetchVariants();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah stok');
    }
  };

  const resetVariantForm = () => {
    setVariantForm({ tipe: '', sku_variant: '', stok: '0', harga_ecer: '', status: 'aktif' });
    setEditingVariant(null);
    setShowVariantForm(false);
  };

  // Variant Pack Management Helpers
  const getPackForm = (variantId) => {
    return packForms[variantId] || defaultPackForm;
  };

  const openPackForm = (variantId, pack = null) => {
    setShowPackFormFor(variantId);
    setEditingPack(pack);
    setPackForms((prev) => ({
      ...prev,
      [variantId]: pack
        ? {
            label: pack.label || '',
            pack_size: pack.pack_size?.toString() || '1',
            harga_pack: pack.harga_pack?.toString() || '',
            status: pack.status || 'aktif',
          }
        : { ...defaultPackForm },
    }));
  };

  const closePackForm = (variantId = null) => {
    setPackForms((prev) => {
      const targetId = variantId ?? showPackFormFor;
      if (!targetId) {
        return prev;
      }
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    setShowPackFormFor(null);
    setEditingPack(null);
  };

  const handlePackFormChange = (variantId, field, value) => {
    setPackForms((prev) => ({
      ...prev,
      [variantId]: {
        ...(prev[variantId] || { ...defaultPackForm }),
        [field]: value,
      },
    }));
  };

  const handleSavePack = async (variantId) => {
    if (!id) return;
    const payload = getPackForm(variantId);
    const body = {
      label: payload.label,
      pack_size: parseInt(payload.pack_size, 10) || 1,
      harga_pack: payload.harga_pack ? parseFloat(payload.harga_pack) : null,
      status: payload.status,
    };
    const isEditingCurrentPack = editingPack && showPackFormFor === variantId;

    // Stok pack selalu 0 saat dibuat, alokasikan stok menggunakan tombol "± Stok" setelah pack dibuat
    if (!isEditingCurrentPack) {
      body.stok = 0;
    }

    try {
      if (isEditingCurrentPack) {
        await api.put(
          `/admin/products/${id}/variants/${variantId}/packs/${editingPack.id}`,
          body
        );
        setMessage('Varian jumlah berhasil diperbarui');
      } else {
        await api.post(`/admin/products/${id}/variants/${variantId}/packs`, body);
        setMessage('Varian jumlah berhasil ditambahkan');
      }
      closePackForm(variantId);
      await fetchVariants();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan varian jumlah');
    }
  };

  const handleDeletePack = async (variantId, packId) => {
    if (!window.confirm('Hapus varian jumlah ini?')) return;
    if (!id) return;

    try {
      await api.delete(`/admin/products/${id}/variants/${variantId}/packs/${packId}`);
      setMessage('Varian jumlah berhasil dihapus');
      await fetchVariants();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus varian jumlah');
    }
  };

  // Product Pack Management Functions (pack langsung dari produk, tanpa variant)
  const handleSaveProductPack = async () => {
    const body = {
      label: productPackForm.label,
      pack_size: parseInt(productPackForm.pack_size, 10) || 1,
      harga_pack: productPackForm.harga_pack ? parseFloat(productPackForm.harga_pack) : null,
      status: productPackForm.status,
    };

    // Jika produk belum dibuat, simpan pack sementara di state
    if (!id) {
      if (editingProductPack) {
        // Edit pending pack
        setPendingPacks(prev => prev.map(p => 
          p.tempId === editingProductPack.tempId ? { ...body, tempId: editingProductPack.tempId } : p
        ));
        setMessage('Paket produk berhasil diperbarui (akan disimpan setelah produk dibuat)');
      } else {
        // Tambah pending pack baru
        const tempId = Date.now(); // Temporary ID
        setPendingPacks(prev => [...prev, { ...body, tempId }]);
        setMessage('Paket produk berhasil ditambahkan (akan disimpan setelah produk dibuat)');
      }
      setShowProductPackForm(false);
      setProductPackForm({ label: '', pack_size: '1', harga_pack: '', status: 'aktif' });
      setEditingProductPack(null);
      return;
    }

    // Jika produk sudah dibuat, langsung simpan ke backend
    try {
      if (editingProductPack) {
        await api.put(`/admin/products/${id}/packs/${editingProductPack.id}`, body);
        setMessage('Paket produk berhasil diperbarui');
      } else {
        await api.post(`/admin/products/${id}/packs`, body);
        setMessage('Paket produk berhasil ditambahkan');
      }
      setShowProductPackForm(false);
      setProductPackForm({ label: '', pack_size: '1', harga_pack: '', status: 'aktif' });
      setEditingProductPack(null);
      await fetchProductPacks();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan paket produk');
    }
  };

  const handleDeleteProductPack = async (packId) => {
    if (!window.confirm('Hapus paket produk ini?')) return;
    
    // Jika pack adalah pending pack (belum ada id)
    if (typeof packId === 'number' && packId.toString().length > 10) {
      setPendingPacks(prev => prev.filter(p => p.tempId !== packId));
      setMessage('Paket produk berhasil dihapus');
      return;
    }

    if (!id) return;

    try {
      await api.delete(`/admin/products/${id}/packs/${packId}`);
      setMessage('Paket produk berhasil dihapus');
      await fetchProductPacks();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus paket produk');
    }
  };

  const handleEditProductPack = (pack) => {
    setEditingProductPack(pack);
    setProductPackForm({
      label: pack.label || '',
      pack_size: pack.pack_size?.toString() || '1',
      harga_pack: pack.harga_pack?.toString() || '',
      status: pack.status || 'aktif',
    });
    setShowProductPackForm(true);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('kategori_id', form.kategori_id);
      formData.append('sku', form.sku);
      formData.append('nama_produk', form.nama_produk);
      formData.append('harga_ecer', form.harga_ecer);
      formData.append('stok', form.stok || '0');
      formData.append('status', form.status);
      if (form.deskripsi) {
        formData.append('deskripsi', form.deskripsi);
      }
      if (form.berat) {
        formData.append('berat', form.berat);
      }
      
      // Append existing images (those not marked for deletion)
      if (existingImages.length > 0) {
        existingImages.forEach((img) => {
          if (!imagesToDelete.includes(img)) {
            formData.append('gambar[]', img);
          }
        });
      }
      
      // Append new image files
      imageFiles.forEach((file) => {
        formData.append('gambar_file[]', file);
      });
      
      // Append images to delete
      imagesToDelete.forEach((img) => {
        formData.append('gambar_hapus[]', img);
      });

      if (isEdit) {
        await api.put(`/products/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Produk berhasil diperbarui');
      } else {
        const response = await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const newProductId = response.data.data?.id || response.data.id;
        
        // Update state untuk mode edit (tetap di halaman yang sama, tidak redirect)
        setSavedProductId(newProductId);
        
        // Set message berdasarkan tipe produk
        if (hasVariants) {
          setMessage('Produk berhasil ditambahkan. Sekarang Anda bisa menambahkan varian produk di bawah ini.');
        } else if (hasPacks) {
          setMessage('Produk berhasil ditambahkan. Sekarang Anda bisa menambahkan paketan produk langsung di bawah ini.');
        } else {
          setMessage('Produk berhasil ditambahkan.');
        }
        
        // Fetch product data dengan ID baru
        try {
          const { data: productData } = await api.get(`/products/${newProductId}`);
          const product = productData.data;
          setForm({
            kategori_id: product.kategori_id || '',
            sku: product.sku || '',
            nama_produk: product.nama_produk || '',
            harga_ecer: product.harga_ecer || '',
            stok: product.stok?.toString() || '0',
            status: product.status || 'aktif',
            deskripsi: product.deskripsi || '',
            berat: product.berat?.toString() || '500',
          });
          const productImages = Array.isArray(product.gambar) 
            ? product.gambar 
            : (product.gambar ? [product.gambar] : []);
          setExistingImages(productImages.map(img => getProductImageUrl(img)));
          
          // Jika ada pending variants, kirim semua ke backend
          if (pendingVariants.length > 0) {
            try {
              for (const variant of pendingVariants) {
                const formData = new FormData();
                formData.append('tipe', variant.tipe);
                if (variant.sku_variant) {
                  formData.append('sku_variant', variant.sku_variant);
                }
                formData.append('stok', variant.stok || '0');
                if (variant.harga_ecer) {
                  formData.append('harga_ecer', variant.harga_ecer);
                }
                formData.append('status', variant.status || 'aktif');
                
                await api.post(`/admin/products/${newProductId}/variants`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
              }
              setPendingVariants([]);
            } catch (err) {
              console.error('Failed to create variants:', err);
              setError('Produk berhasil dibuat, tapi gagal membuat varian. Silakan tambahkan varian secara manual.');
            }
          }
          
          // Jika ada pending packs, kirim semua ke backend
          if (pendingPacks.length > 0) {
            try {
              for (const pack of pendingPacks) {
                await api.post(`/admin/products/${newProductId}/packs`, {
                  label: pack.label,
                  pack_size: pack.pack_size,
                  harga_pack: pack.harga_pack,
                  status: pack.status,
                });
              }
              setPendingPacks([]);
              setMessage('Produk dan paketan berhasil dibuat');
            } catch (err) {
              console.error('Failed to create packs:', err);
              setError('Produk berhasil dibuat, tapi gagal membuat paketan. Silakan tambahkan paketan secara manual.');
            }
          }
          
          // Fetch variants (jika ada)
          if (hasVariants) {
            const fetchedVariants = await fetchVariants(newProductId);
            // Auto-open variant form jika belum ada varian (langsung tampil tanpa perlu klik)
            if ((!fetchedVariants || fetchedVariants.length === 0) && pendingVariants.length === 0) {
              setShowVariantForm(true);
              // Reset form untuk varian baru
              setVariantForm({ tipe: '', sku_variant: '', stok: '0', harga_ecer: '', status: 'aktif' });
              setEditingVariant(null);
            }
          }
          
          // Fetch packs langsung dari produk (jika tidak ada variant tapi ada packs)
          if (!hasVariants && hasPacks) {
            const fetchProductPacksHelper = async () => {
              try {
                const { data: packsData } = await api.get(`/admin/products/${newProductId}/packs`);
                const packs = packsData.data || [];
                setProductPacks(packs);
                return packs;
              } catch (err) {
                if (err.response?.status !== 422) {
                  console.error('Failed to fetch product packs:', err);
                }
                setProductPacks([]);
                return [];
              }
            };
            await fetchProductPacksHelper();
          }
        } catch (err) {
          console.error('Failed to fetch product:', err);
        }
        
        return; // Tidak redirect ke list, tetap di halaman ini
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h1>
          <p className="text-sm text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit ? 'Perbarui informasi produk' : 'Pilih tipe produk terlebih dahulu, lalu isi form di bawah'}
          </p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate('/admin/products')}
        >
          Kembali
        </button>
      </div>

      {/* Product Type Selection (only for new products) */}
      {!isEdit && (
        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Tipe Produk</h2>
            <p className="text-sm text-slate-500 mb-4">
              Pilih apakah produk ini memiliki varian atau tidak. Anda bisa membuat paketan untuk kedua tipe produk.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  !hasVariants && !hasPacks
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => {
                  setHasVariants(false);
                  setHasPacks(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="productType"
                    checked={!hasVariants && !hasPacks}
                    onChange={() => {
                      setHasVariants(false);
                      setHasPacks(false);
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Produk Tanpa Varian</h3>
                    <p className="text-sm text-slate-600">
                      Produk sederhana tanpa varian. Stok dikelola langsung di level produk.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  hasVariants
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => {
                  setHasVariants(true);
                  setHasPacks(false);
                  // Auto-open variant form saat memilih "Produk dengan Varian"
                  setShowVariantForm(true);
                }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="productType"
                    checked={hasVariants}
                    onChange={() => {
                      setHasVariants(true);
                      setHasPacks(false);
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Produk dengan Varian</h3>
                    <p className="text-sm text-slate-600">
                      Produk dengan beberapa varian (contoh: BP REGULER, BP KIDS, BP BLUE). Setiap varian bisa memiliki paketan sendiri.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pack option for non-variant products */}
            {!hasVariants && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="hasPacks"
                    checked={hasPacks}
                    onChange={(e) => setHasPacks(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="hasPacks" className="font-medium text-slate-900 cursor-pointer">
                      Buat Paketan untuk Produk Ini
                    </label>
                    <p className="text-sm text-slate-600 mt-1">
                      Centang jika Anda ingin membuat paketan (1 botol, 3 botol, 5 botol, dll) untuk produk ini. 
                      Paketan akan dibuat langsung dari produk tanpa perlu membuat varian.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                className="input-field w-full"
                value={form.kategori_id}
                onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU{' '}
                {((!isEdit && !hasVariants) || (isEdit && variants.length === 0)) ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-xs text-slate-500 font-normal">(Opsional jika ada varian)</span>
                )}
              </label>
              <input
                className="input-field w-full"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Contoh: PROD-001"
                required={(!isEdit && !hasVariants) || (isEdit && variants.length === 0)}
              />
              {((!isEdit && hasVariants) || (isEdit && variants.length > 0)) && (
                <p className="text-xs text-slate-500 mt-1">
                  SKU produk bisa kosong jika produk memiliki varian (SKU ada di level varian)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field w-full"
                value={form.nama_produk}
                onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                placeholder="Nama produk"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Harga Ecer (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field w-full"
                type="number"
                value={form.harga_ecer}
                onChange={(e) => setForm({ ...form, harga_ecer: e.target.value })}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stok <span className="text-red-500">*</span>
                {((!isEdit && hasVariants) || (isEdit && variants.length > 0)) && (
                  <span className="ml-2 text-xs font-normal text-yellow-600">
                    (Stok produk diabaikan jika ada varian)
                  </span>
                )}
              </label>
              <input
                className={`input-field w-full ${
                  ((!isEdit && hasVariants) || (isEdit && variants.length > 0)) ? 'bg-slate-100 cursor-not-allowed' : ''
                }`}
                type="number"
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: e.target.value })}
                placeholder="0"
                min="0"
                required
                disabled={(!isEdit && hasVariants) || (isEdit && variants.length > 0)}
              />
              <p className="text-xs text-slate-500 mt-1">
                {((!isEdit && hasVariants) || (isEdit && variants.length > 0))
                  ? 'Produk ini memiliki varian. Kelola stok melalui varian/paket di bagian bawah.'
                  : 'Jumlah stok awal produk (jika produk tidak memiliki varian)'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="input-field w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Berat (gram) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="input-field w-full"
                value={form.berat}
                onChange={(e) => setForm({ ...form, berat: e.target.value })}
                min="1"
                placeholder="500"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Berat produk dalam gram (default: 500g)</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi
              </label>
              <textarea
                className="input-field w-full"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={4}
                placeholder="Deskripsi produk..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gambar Produk (Bisa upload lebih dari 1 gambar)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="input-field w-full"
                onChange={handleImageChange}
                multiple
              />
              <p className="text-xs text-slate-500 mt-1">
                Pilih satu atau lebih gambar. Format: JPG, PNG, atau WebP (max 2MB per gambar)
              </p>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Gambar Saat Ini:</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Gambar ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Image Previews */}
              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Gambar Baru:</p>
                  <div className="flex flex-wrap gap-3">
                    {imageFiles.map((file, idx) => {
                      const preview = URL.createObjectURL(file);
                      return (
                        <div key={idx} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageFile(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {!isEdit && (hasVariants || hasPacks) && (
            <div className="card bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Progress Pembuatan Produk</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${id ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {id ? '✓' : '1'} Produk
                    </span>
                    <span className="text-slate-400">→</span>
                    {hasVariants && (
                      <>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${variants.length > 0 ? 'bg-green-100 text-green-700' : pendingVariants.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                          {variants.length > 0 ? '✓' : pendingVariants.length > 0 ? pendingVariants.length : '0'} Varian
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-500">
                          Paketan
                        </span>
                      </>
                    )}
                    {!hasVariants && hasPacks && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${productPacks.length > 0 ? 'bg-green-100 text-green-700' : pendingPacks.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {productPacks.length > 0 ? '✓' : pendingPacks.length > 0 ? pendingPacks.length : '0'} Paketan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Variants Management Section */}
          {hasVariants && (
            <div className="border-t pt-6 mt-6">
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setIsVariantsSectionOpen(!isVariantsSectionOpen)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">Manajemen Varian Produk</h2>
                    {!id && pendingVariants.length > 0 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                        {pendingVariants.length} Draft
                      </span>
                    )}
                    {id && variants.length > 0 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        {variants.length} Varian
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Kelola varian produk (BP REGULER, BP KIDS, BP BLUE, dll)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (showVariantForm) {
                        resetVariantForm();
                      } else {
                        setShowVariantForm(true);
                        setIsVariantsSectionOpen(true);
                      }
                    }}
                    className="btn-primary text-sm"
                  >
                    {showVariantForm ? 'Batal' : '+ Tambah Varian'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVariantsSectionOpen(!isVariantsSectionOpen);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    {isVariantsSectionOpen ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {isVariantsSectionOpen && (
                <>
              

              {/* Pending Variants List (belum disimpan) */}
              {!id && pendingVariants.length > 0 && (
                <div className="mb-4 space-y-3">
                  <h3 className="font-semibold text-slate-900">Varian yang Akan Dibuat:</h3>
                  {pendingVariants.map((variant) => (
                    <div
                      key={variant.tempId}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1 min-w-[250px]">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">{variant.tipe}</h4>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                              Menunggu disimpan
                            </span>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Stok:</span>
                              <span className="font-semibold text-slate-900 ml-2">{variant.stok || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Harga:</span>
                              <span className="font-semibold text-slate-900 ml-2">
                                {variant.harga_ecer ? formatCurrency(variant.harga_ecer) : 'Sama dengan produk'}
                              </span>
                            </div>
                            {variant.sku_variant && (
                              <div>
                                <span className="text-slate-500">SKU:</span>
                                <span className="font-semibold text-slate-900 ml-2">{variant.sku_variant}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const variantToEdit = pendingVariants.find(v => v.tempId === variant.tempId);
                              if (variantToEdit) {
                                setEditingVariant(variantToEdit);
                                setVariantForm({
                                  tipe: variantToEdit.tipe || '',
                                  sku_variant: variantToEdit.sku_variant || '',
                                  stok: variantToEdit.stok || '0',
                                  harga_ecer: variantToEdit.harga_ecer || '',
                                  status: variantToEdit.status || 'aktif',
                                });
                                setShowVariantForm(true);
                                setPendingVariants(prev => prev.filter(v => v.tempId !== variant.tempId));
                              }
                            }}
                            className="btn-outline text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(variant.tempId)}
                            className="btn-outline text-xs text-red-600 hover:text-red-700"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Variant Form */}
              {showVariantForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    {editingVariant ? 'Edit Varian' : 'Tambah Varian Baru'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tipe Varian <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="input-field w-full"
                        value={variantForm.tipe}
                        onChange={(e) => setVariantForm({ ...variantForm, tipe: e.target.value })}
                        placeholder="Contoh: BP REGULER (dewasa)"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        SKU Varian <span className="text-xs text-slate-500">(Opsional)</span>
                      </label>
                      <input
                        className="input-field w-full"
                        value={variantForm.sku_variant}
                        onChange={(e) => setVariantForm({ ...variantForm, sku_variant: e.target.value })}
                        placeholder="Contoh: BP-REG-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Stok <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="input-field w-full"
                        type="number"
                        value={variantForm.stok}
                        onChange={(e) => setVariantForm({ ...variantForm, stok: e.target.value })}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Harga Ecer (Rp) <span className="text-xs text-slate-500">(Opsional, kosongkan jika sama dengan harga produk)</span>
                      </label>
                      <input
                        className="input-field w-full"
                        type="number"
                        value={variantForm.harga_ecer}
                        onChange={(e) => setVariantForm({ ...variantForm, harga_ecer: e.target.value })}
                        placeholder="Kosongkan jika sama dengan harga produk"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="input-field w-full"
                        value={variantForm.status}
                        onChange={(e) => setVariantForm({ ...variantForm, status: e.target.value })}
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={editingVariant ? handleUpdateVariant : handleAddVariant}
                      className="btn-primary text-sm"
                    >
                      {editingVariant ? 'Perbarui Varian' : 'Tambah Varian'}
                    </button>
                    <button
                      type="button"
                      onClick={resetVariantForm}
                      className="btn-outline text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Variants List */}
              {variants.length > 0 ? (
                <div className="space-y-3">
                  {variants.map((variant) => {
                    const isPackFormVisible = showPackFormFor === variant.id;
                    const packForm = getPackForm(variant.id);
                    const isEditingCurrentPack = isPackFormVisible && editingPack;

                    return (
                      <div
                        key={variant.id}
                        className="bg-white border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div className="flex-1 min-w-[250px]">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-slate-900">{variant.tipe}</h4>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  variant.status === 'aktif'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {variant.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500">Stok:</span>
                                <span className="font-semibold text-slate-900 ml-2">
                                  {variant.stok || 0} (Tersedia: {variant.stok_available || 0})
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Harga:</span>
                                <span className="font-semibold text-slate-900 ml-2">
                                  {variant.harga_ecer
                                    ? formatCurrency(variant.harga_ecer)
                                    : 'Sama dengan produk'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">SKU Variant:</span>
                                <span className="font-semibold text-slate-900 ml-2">
                                  {variant.sku_variant || '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-auto">
                            <button
                              type="button"
                              onClick={() => handleEditVariant(variant)}
                              className="btn-outline text-xs px-3 py-1"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const qty = prompt('Masukkan jumlah stok yang ingin ditambahkan (bisa negatif untuk mengurangi):', '0');
                                if (qty !== null) {
                                  handleAddStockVariant(variant.id, parseInt(qty, 10) || 0);
                                }
                              }}
                              className="btn-outline text-xs px-3 py-1"
                            >
                              ± Stok
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(variant.id)}
                              className="btn-outline text-xs px-3 py-1 text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div>
                              <p className="font-semibold text-slate-900">Paketan Varian</p>
                              <p className="text-xs text-slate-500">
                                Kelola paket jumlah botol untuk varian ini (1 botol, 3 botol, 5 botol, dll)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => openPackForm(variant.id)}
                              className="btn-primary text-xs px-3 py-1"
                            >
                              + Tambah Paket
                            </button>
                          </div>

                          {isPackFormVisible && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3">
                              <h5 className="font-semibold text-slate-900 mb-3">
                                {isEditingCurrentPack ? 'Edit Paket' : 'Tambah Paket Baru'}
                              </h5>
                              <div className="grid md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Label Paket
                                  </label>
                                  <input
                                    className="input-field w-full"
                                    value={packForm.label}
                                    onChange={(e) => handlePackFormChange(variant.id, 'label', e.target.value)}
                                    placeholder="Contoh: 3 Botol"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Jumlah Botol <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    className="input-field w-full"
                                    value={packForm.pack_size}
                                    onChange={(e) => handlePackFormChange(variant.id, 'pack_size', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Harga Paket (Rp)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    className="input-field w-full"
                                    value={packForm.harga_pack}
                                    onChange={(e) => handlePackFormChange(variant.id, 'harga_pack', e.target.value)}
                                    placeholder="Kosongkan untuk otomatis"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Status
                                  </label>
                                  <select
                                    className="input-field w-full"
                                    value={packForm.status}
                                    onChange={(e) => handlePackFormChange(variant.id, 'status', e.target.value)}
                                  >
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button
                                  type="button"
                                  onClick={() => handleSavePack(variant.id)}
                                  className="btn-primary text-xs"
                                >
                                  {isEditingCurrentPack ? 'Perbarui Paket' : 'Simpan Paket'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => closePackForm(variant.id)}
                                  className="btn-outline text-xs"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          )}

                          {variant.packs && variant.packs.length > 0 ? (
                            <div className="space-y-2">
                              {variant.packs.map((pack) => (
                                <div
                                  key={pack.id}
                                  className="border border-slate-200 rounded-lg p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {pack.label || `${pack.pack_size} Botol`}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {pack.pack_size} botol per paket • SKU: {pack.sku_pack || '-'}
                                    </p>
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    <p>
                                      Harga Paket:{' '}
                                      <span className="font-semibold text-slate-900">
                                        {pack.harga_pack ? formatCurrency(pack.harga_pack) : 'Mengikuti harga varian'}
                                      </span>
                                    </p>
                                    <p>
                                      Stok Tersedia:{' '}
                                      <span className="font-semibold text-slate-900">
                                        {pack.stok_available ?? 0} paket
                                      </span>
                                      <span className="text-xs text-slate-500 ml-1">
                                        (dari stok varian: {variant.stok_available ?? 0} botol)
                                      </span>
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openPackForm(variant.id, pack)}
                                      className="btn-outline text-xs px-3 py-1"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePack(variant.id, pack.id)}
                                      className="btn-outline text-xs px-3 py-1 text-red-600 hover:bg-red-50"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">Belum ada varian jumlah.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Belum ada varian untuk produk ini.</p>
                  <p className="text-sm mt-1">Klik "Tambah Varian" untuk menambahkan varian baru.</p>
                </div>
              )}
                </>
              )}
            </div>
          )}

          {/* Product Packs Management Section (pack langsung dari produk, tanpa variant) */}
          {!hasVariants && hasPacks && (
            <div className="border-t pt-6 mt-6">
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setIsPacksSectionOpen(!isPacksSectionOpen)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">Manajemen Paketan Produk</h2>
                    {!id && pendingPacks.length > 0 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                        {pendingPacks.length} Draft
                      </span>
                    )}
                    {id && productPacks.length > 0 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        {productPacks.length} Paketan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Kelola paketan produk langsung (1 botol, 3 botol, 5 botol, dll) tanpa perlu membuat varian
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!id) {
                        setShowProductPackForm(true);
                        setIsPacksSectionOpen(true);
                      } else {
                        setProductPackForm({ label: '', pack_size: '1', harga_pack: '', status: 'aktif' });
                        setEditingProductPack(null);
                        setShowProductPackForm(!showProductPackForm);
                      }
                    }}
                    className="btn-primary text-sm"
                    disabled={!id && pendingPacks.length >= 5}
                  >
                    {showProductPackForm ? 'Batal' : '+ Tambah Paket'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPacksSectionOpen(!isPacksSectionOpen);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    {isPacksSectionOpen ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {isPacksSectionOpen && (
                <>
              {/* Product Pack Form */}
              {showProductPackForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    {editingProductPack ? 'Edit Paket Produk' : 'Tambah Paket Produk'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Label Paket (Opsional)
                      </label>
                      <input
                        className="input-field w-full"
                        value={productPackForm.label}
                        onChange={(e) => setProductPackForm({ ...productPackForm, label: e.target.value })}
                        placeholder="Contoh: Paket Hemat 3 Botol"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Jumlah Botol per Paket <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="input-field w-full"
                        type="number"
                        value={productPackForm.pack_size}
                        onChange={(e) => setProductPackForm({ ...productPackForm, pack_size: e.target.value })}
                        placeholder="1"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Harga Paket (Opsional)
                      </label>
                      <input
                        className="input-field w-full"
                        type="number"
                        value={productPackForm.harga_pack}
                        onChange={(e) => setProductPackForm({ ...productPackForm, harga_pack: e.target.value })}
                        placeholder="Kosongkan untuk mengikuti harga produk"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Jika kosong, harga akan dihitung dari harga produk × jumlah botol
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="input-field w-full"
                        value={productPackForm.status}
                        onChange={(e) => setProductPackForm({ ...productPackForm, status: e.target.value })}
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleSaveProductPack}
                      className="btn-primary text-sm"
                    >
                      {editingProductPack ? 'Perbarui Paket' : 'Tambah Paket'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductPackForm(false);
                        setProductPackForm({ label: '', pack_size: '1', harga_pack: '', status: 'aktif' });
                        setEditingProductPack(null);
                      }}
                      className="btn-outline text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Product Packs List */}
              {(pendingPacks.length > 0 || productPacks.length > 0) ? (
                <div className="space-y-3">
                  {/* Pending Packs (belum disimpan) */}
                  {pendingPacks.map((pack) => (
                    <div
                      key={pack.tempId}
                      className="border border-amber-200 bg-amber-50 rounded-lg p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {pack.label || `${pack.pack_size} Botol`}
                          <span className="ml-2 text-xs text-amber-600">(Menunggu disimpan)</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {pack.pack_size} botol per paket
                        </p>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>
                          Harga Paket:{' '}
                          <span className="font-semibold text-slate-900">
                            {pack.harga_pack ? formatCurrency(pack.harga_pack) : 'Mengikuti harga produk'}
                          </span>
                        </p>
                        <p>
                          Status:{' '}
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              pack.status === 'aktif'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {pack.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProductPack(pack)}
                          className="btn-outline text-xs px-3 py-1"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProductPack(pack.tempId)}
                          className="btn-outline text-xs px-3 py-1 text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Saved Packs (sudah di database) */}
                  {productPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="border border-slate-200 rounded-lg p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {pack.label || `${pack.pack_size} Botol`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {pack.pack_size} botol per paket • SKU: {pack.sku_pack || '-'}
                        </p>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>
                          Harga Paket:{' '}
                          <span className="font-semibold text-slate-900">
                            {pack.harga_pack ? formatCurrency(pack.harga_pack) : 'Mengikuti harga produk'}
                          </span>
                        </p>
                        <p>
                          Status:{' '}
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              pack.status === 'aktif'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {pack.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProductPack(pack)}
                          className="btn-outline text-xs px-3 py-1"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProductPack(pack.id)}
                          className="btn-outline text-xs px-3 py-1 text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm mt-1">
                  {showProductPackForm
                    ? 'Isi form di atas untuk menambahkan paket produk.'
                    : 'Klik "Tambah Paket" untuk menambahkan paket produk baru.'}
                </p>
              )}
                </>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Produk' : 'Tambah Produk'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/admin/products')}
              disabled={loading}
            >
              Batal
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm">{message}</p>
              <p className="text-xs text-green-600 mt-1">Mengalihkan ke halaman produk...</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminProductFormPage;

