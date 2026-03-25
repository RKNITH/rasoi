import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchMenuItems, fetchCategories, createMenuItem,
  updateMenuItem, deleteMenuItem, toggleMenuItemAvailability
} from '../../store/slices/menuSlice.js';
import {
  PageHeader, Modal, Button, Input, Textarea,
  SearchBar, EmptyState, Toggle, ConfirmDialog
} from '../../components/common/index.jsx';
import { formatCurrency } from '../../utils/helpers.js';
import {
  FiPlus, FiEdit, FiTrash2, FiStar, FiImage, FiLink,
  FiUpload, FiX, FiChevronDown, FiInfo, FiFilter, FiTag
} from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

// ─── Empty form state (every field the backend accepts) ──────────────────────
const emptyForm = {
  name: '', description: '', category: '',
  price: '', discountedPrice: '', preparationTime: '15',
  spiceLevel: '0',
  isVegetarian: false, isVegan: false, isGlutenFree: false,
  isSpicy: false, isAvailable: true, isFeatured: false,
  ingredients: '', allergens: '', tags: '',
  calories: '', protein: '', carbs: '', fat: '',
  imageMode: 'file',   // 'file' | 'url'
  imageUrl: '',
};

// ─── Spice level labels ───────────────────────────────────────────────────────
const SPICE_LABELS = ['None', 'Mild', 'Medium', 'Hot', 'Very Hot', 'Extra Hot'];
const SPICE_COLORS = ['text-gray-400', 'text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500', 'text-red-700'];

// ─── Small reusable section header inside form ────────────────────────────────
function FormSection({ title, children }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Image picker: supports local file OR external URL ────────────────────────
function ImagePicker({ mode, url, previewSrc, onModeChange, onUrlChange, onFileChange, onClear }) {
  const fileRef = useRef();
  return (
    <div className="space-y-2">
      {/* mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[['file', FiUpload, 'Upload File'], ['url', FiLink, 'Image URL']].map(([m, Icon, label]) => (
          <button
            key={m} type="button"
            onClick={() => onModeChange(m)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${mode === m ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <div
          onClick={() => fileRef.current.click()}
          className="relative border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-xl p-4 text-center cursor-pointer transition-colors group"
        >
          {previewSrc ? (
            <div className="relative inline-block">
              <img src={previewSrc} alt="preview" className="h-28 w-auto rounded-lg object-cover mx-auto" />
              <button
                type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="py-4">
              <FiImage className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-primary-400 transition-colors" />
              <p className="text-sm text-gray-400">Click to upload image</p>
              <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP — max 5 MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={url} onChange={e => onUrlChange(e.target.value)}
            icon={<FiLink className="w-4 h-4" />}
          />
          {url && (
            <div className="relative inline-block">
              <img
                src={url} alt="preview"
                className="h-28 rounded-xl object-cover border border-gray-100"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <FiInfo className="w-3 h-3" /> Paste a direct image URL. It will be saved as-is (no re-upload).
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Category badge with color dot ───────────────────────────────────────────
function CategoryBadge({ category }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
      {category.icon && <span style={{ fontSize: 12 }}>{category.icon}</span>}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: category.color || '#FF6B35' }}
      />
      {category.name}
    </span>
  );
}

// ─── Category select with colour indicator ────────────────────────────────────
function CategorySelect({ categories, value, onChange }) {
  const selected = categories.find(c => c._id === value);
  return (
    <div>
      <label className="label">Category <span className="text-red-500">*</span></label>
      <div className="relative">
        <select
          value={value} onChange={onChange} required
          className="input-field appearance-none pr-10 pl-8"
          disabled={categories.length === 0}
        >
          <option value="">
            {categories.length === 0 ? 'No categories — add one first' : 'Select category…'}
          </option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.icon ? c.icon + ' ' : ''}{c.name}</option>
          ))}
        </select>
        {/* colour dot left */}
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white shadow-sm transition-colors"
          style={{ background: selected?.color || '#e5e7eb' }}
        />
        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {categories.length === 0 && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <FiInfo className="w-3 h-3" />
          You need to create a category before adding menu items. Use the seed script or add one via the API.
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MenuManagementPage() {
  const dispatch = useDispatch();
  const { items, categories, isLoading } = useSelector(s => s.menu);

  const [search, setSearch] = useState('');
  const [selCat, setSelCat] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all'); // 'all'|'veg'|'nonveg'|'spicy'|'featured'|'unavailable'
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'details' | 'image'

  // Category management
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', icon: '', color: '#FF6B35', description: '' });
  const [catSaving, setCatSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMenuItems());
  }, [dispatch]);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return toast.error('Category name required');
    setCatSaving(true);
    try {
      await api.post('/categories', catForm);
      toast.success('Category created!');
      dispatch(fetchCategories());
      setCatForm({ name: '', icon: '', color: '#FF6B35', description: '' });
      setShowCatModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCatSaving(false);
    }
  };

  // ── Derived filtered list ─────────────────────────────────────────────────
  const filtered = items.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) &&
        !i.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (selCat && i.category?._id !== selCat) return false;
    if (activeQuickFilter === 'veg'         && !i.isVegetarian) return false;
    if (activeQuickFilter === 'nonveg'      && i.isVegetarian) return false;
    if (activeQuickFilter === 'spicy'       && !i.isSpicy && i.spiceLevel === 0) return false;
    if (activeQuickFilter === 'featured'    && !i.isFeatured) return false;
    if (activeQuickFilter === 'unavailable' && i.isAvailable) return false;
    if (activeQuickFilter === 'vegan'       && !i.isVegan) return false;
    return true;
  });

  // ── Form helpers ──────────────────────────────────────────────────────────
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const openCreate = () => {
    setForm(emptyForm);
    setEditItem(null);
    setImageFile(null);
    setImagePreview('');
    setActiveTab('basic');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category?._id || '',
      price: item.price,
      discountedPrice: item.discountedPrice || '',
      preparationTime: item.preparationTime || 15,
      spiceLevel: item.spiceLevel ?? 0,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree || false,
      isSpicy: item.isSpicy,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      ingredients: (item.ingredients || []).join(', '),
      allergens: (item.allergens || []).join(', '),
      tags: (item.tags || []).join(', '),
      calories: item.nutritionInfo?.calories || '',
      protein: item.nutritionInfo?.protein || '',
      carbs: item.nutritionInfo?.carbs || '',
      fat: item.nutritionInfo?.fat || '',
      imageMode: item.image ? 'url' : 'file',
      imageUrl: item.image || '',
    });
    setImageFile(null);
    setImagePreview(item.image || '');
    setEditItem(item);
    setActiveTab('basic');
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    set('imageUrl', '');
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!form.name.trim()) return toast.error('Item name is required');
    if (!form.category) return toast.error('Please select a category');
    if (!form.price || isNaN(form.price)) return toast.error('Valid price is required');
    if (form.discountedPrice && parseFloat(form.discountedPrice) >= parseFloat(form.price)) {
      return toast.error('Discounted price must be less than original price');
    }

    const fd = new FormData();

    // Basic fields
    fd.append('name', form.name.trim());
    fd.append('description', form.description.trim());
    fd.append('category', form.category);
    fd.append('price', form.price);
    if (form.discountedPrice) fd.append('discountedPrice', form.discountedPrice);
    fd.append('preparationTime', form.preparationTime);
    fd.append('spiceLevel', form.spiceLevel);

    // Booleans — send as string 'true'/'false' (controller parses them)
    fd.append('isVegetarian', form.isVegetarian);
    fd.append('isVegan', form.isVegan);
    fd.append('isGlutenFree', form.isGlutenFree);
    fd.append('isSpicy', form.isSpicy);
    fd.append('isAvailable', form.isAvailable);
    fd.append('isFeatured', form.isFeatured);

    // Array fields (comma-separated → controller splits)
    if (form.ingredients.trim()) fd.append('ingredients', form.ingredients.trim());
    if (form.allergens.trim()) fd.append('allergens', form.allergens.trim());
    if (form.tags.trim()) fd.append('tags', form.tags.trim());

    // Nutrition
    if (form.calories) fd.append('calories', form.calories);
    if (form.protein) fd.append('protein', form.protein);
    if (form.carbs) fd.append('carbs', form.carbs);
    if (form.fat) fd.append('fat', form.fat);

    // Image: file or URL
    if (form.imageMode === 'file' && imageFile) {
      fd.append('image', imageFile);
    } else if (form.imageMode === 'url' && form.imageUrl.trim()) {
      fd.append('imageUrl', form.imageUrl.trim());
    }

    const action = editItem
      ? updateMenuItem({ id: editItem._id, data: fd })
      : createMenuItem(fd);

    const res = await dispatch(action);
    if (createMenuItem.fulfilled.match(res) || updateMenuItem.fulfilled.match(res)) {
      toast.success(editItem ? 'Item updated!' : 'Item created!');
      setShowForm(false);
    } else {
      toast.error(res.payload?.message || 'Something went wrong');
    }
  };

  // ── Tabs for form ─────────────────────────────────────────────────────────
  const TABS = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Details & Nutrition' },
    { id: 'image', label: 'Image' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Management"
        subtitle={`${items.length} items · ${categories.length} categories`}
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowCatModal(true)} className="btn-ghost flex items-center gap-2 text-sm border border-gray-200">
              <FiTag className="w-4 h-4" /> Manage Categories
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
              <FiPlus className="w-4 h-4" /> Add Item
            </button>
          </div>
        }
      />

      {/* ── Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search menu…" className="flex-1" />

        <div className="flex gap-2 flex-wrap items-center">
          {/* Category filter */}
          <div className="relative">
            <select
              value={selCat}
              onChange={e => setSelCat(e.target.value)}
              className="input-field pr-8 pl-3 py-2 text-sm sm:w-44"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.icon ? c.icon + ' ' : ''}{c.name}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {(selCat || activeQuickFilter !== 'all' || search) && (
            <button
              onClick={() => { setSelCat(''); setActiveQuickFilter('all'); setSearch(''); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 flex items-center gap-1"
            >
              <FiX className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <p className="text-sm text-gray-400">{filtered.length} shown</p>
      </div>

      {/* ── Quick filter pills ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all',         label: '🍽 All' },
          { id: 'veg',         label: '🌿 Veg' },
          { id: 'nonveg',      label: '🍗 Non-Veg' },
          { id: 'spicy',       label: '🌶 Spicy' },
          { id: 'vegan',       label: '🌱 Vegan' },
          { id: 'featured',    label: '⭐ Featured' },
          { id: 'unavailable', label: '✗ Off Menu' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setActiveQuickFilter(activeQuickFilter === f.id ? 'all' : f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeQuickFilter === f.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Category quick-filter chips ── */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelCat('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!selCat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => setSelCat(selCat === c._id ? '' : c._id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${selCat === c._id ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={selCat === c._id ? { background: c.color || '#FF6B35' } : {}}
            >
              {c.icon && <span style={{ fontSize: 12 }}>{c.icon}</span>}
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="card h-64 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🍽"
          title="No items found"
          action={<button onClick={openCreate} className="btn-primary text-sm">Add First Item</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div
                key={item._id} layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`card overflow-hidden group ${!item.isAvailable ? 'opacity-60' : ''}`}
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-50 overflow-hidden">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-5xl">🍽</div>
                  }
                  {/* Badges top-right */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {item.isFeatured && (
                      <span className="bg-amber-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <FiStar className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="w-5 h-5 bg-green-500 border-2 border-white rounded flex items-center justify-center text-white text-xs font-bold">V</span>
                    )}
                    {item.isVegan && (
                      <span className="w-5 h-5 bg-teal-500 border-2 border-white rounded flex items-center justify-center text-white text-xs font-bold">🌱</span>
                    )}
                  </div>
                  {/* Spice indicator */}
                  {item.spiceLevel > 0 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                        {'🌶'.repeat(Math.min(item.spiceLevel, 3))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-dark-500 text-sm flex-1 line-clamp-1">{item.name}</h3>
                  </div>

                  <CategoryBadge category={item.category} />

                  <div className="flex items-center gap-2 mt-2 mb-1">
                    <span className="font-bold text-primary-500 text-sm">{formatCurrency(item.discountedPrice || item.price)}</span>
                    {item.discountedPrice && (
                      <span className="text-xs text-gray-300 line-through">{formatCurrency(item.price)}</span>
                    )}
                    {item.discountedPrice && (
                      <span className="text-xs bg-green-100 text-green-700 px-1 rounded font-medium">
                        {Math.round((1 - item.discountedPrice / item.price) * 100)}% off
                      </span>
                    )}
                  </div>

                  {item.ratings?.count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-500 mb-2">
                      <FiStar className="w-3 h-3 fill-amber-400" />
                      {item.ratings.average.toFixed(1)} ({item.ratings.count})
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => dispatch(toggleMenuItemAvailability(item._id))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${item.isAvailable
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                      {item.isAvailable ? '✓ Available' : '✗ Off Menu'}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editItem ? `Edit: ${editItem.name}` : 'Add New Menu Item'}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Tab nav */}
          <div className="flex border-b border-gray-100 px-6">
            {TABS.map(t => (
              <button
                key={t.id} type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

            {/* ── TAB: Basic Info ── */}
            {activeTab === 'basic' && (
              <div className="space-y-5">
                <FormSection title="Item Details">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Item Name *"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Paneer Butter Masala"
                      required
                    />
                    <CategorySelect
                      categories={categories}
                      value={form.category}
                      onChange={e => set('category', e.target.value)}
                    />
                  </div>
                  <Textarea
                    label="Description"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={3}
                    placeholder="Describe the dish, cooking style, taste…"
                  />
                </FormSection>

                <FormSection title="Pricing & Timing">
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Price (₹) *"
                      type="number" min="0" step="1"
                      value={form.price}
                      onChange={e => set('price', e.target.value)}
                      required
                    />
                    <Input
                      label="Discounted Price (₹)"
                      type="number" min="0" step="1"
                      value={form.discountedPrice}
                      onChange={e => set('discountedPrice', e.target.value)}
                      placeholder="Optional"
                    />
                    <Input
                      label="Prep Time (min)"
                      type="number" min="1"
                      value={form.preparationTime}
                      onChange={e => set('preparationTime', e.target.value)}
                    />
                  </div>
                </FormSection>

                <FormSection title="Spice Level">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {SPICE_LABELS.map((label, i) => (
                        <button
                          key={i} type="button"
                          onClick={() => { set('spiceLevel', i); set('isSpicy', i > 0); }}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${parseInt(form.spiceLevel) === i
                              ? 'border-primary-400 bg-primary-50 text-primary-700'
                              : 'border-gray-200 text-gray-400 hover:border-gray-300'
                            }`}
                        >
                          {i === 0 ? '—' : '🌶'.repeat(Math.min(i, 3))}
                        </button>
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${SPICE_COLORS[parseInt(form.spiceLevel)]}`}>
                      {SPICE_LABELS[parseInt(form.spiceLevel)]}
                    </p>
                  </div>
                </FormSection>

                <FormSection title="Dietary Flags">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      ['isVegetarian', '🌿', 'Vegetarian'],
                      ['isVegan', '🌱', 'Vegan'],
                      ['isGlutenFree', '🌾', 'Gluten Free'],
                      ['isSpicy', '🌶', 'Spicy'],
                      ['isAvailable', '✓', 'Available'],
                      ['isFeatured', '⭐', 'Featured'],
                    ].map(([key, icon, label]) => (
                      <label key={key} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${form[key] ? 'border-primary-300 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                        }`}>
                        <Toggle checked={form[key]} onChange={v => set(key, v)} />
                        <span className="text-sm">{icon} {label}</span>
                      </label>
                    ))}
                  </div>
                </FormSection>
              </div>
            )}

            {/* ── TAB: Details & Nutrition ── */}
            {activeTab === 'details' && (
              <div className="space-y-5">
                <FormSection title="Ingredients & Tags">
                  <Textarea
                    label="Ingredients (comma-separated)"
                    value={form.ingredients}
                    onChange={e => set('ingredients', e.target.value)}
                    rows={2}
                    placeholder="Paneer, Tomato, Butter, Cream, Spices"
                  />
                  <Input
                    label="Allergens (comma-separated)"
                    value={form.allergens}
                    onChange={e => set('allergens', e.target.value)}
                    placeholder="Dairy, Gluten, Nuts"
                  />
                  <Input
                    label="Tags (comma-separated)"
                    value={form.tags}
                    onChange={e => set('tags', e.target.value)}
                    placeholder="bestseller, chef-special, new"
                  />
                </FormSection>

                <FormSection title="Nutrition Info (per serving, optional)">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      ['calories', 'Calories (kcal)', '0'],
                      ['protein', 'Protein (g)', '0'],
                      ['carbs', 'Carbs (g)', '0'],
                      ['fat', 'Fat (g)', '0'],
                    ].map(([key, label, placeholder]) => (
                      <div key={key}>
                        <label className="label text-xs">{label}</label>
                        <input
                          type="number" min="0" step="0.1"
                          value={form[key]}
                          onChange={e => set(key, e.target.value)}
                          placeholder={placeholder}
                          className="input-field"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <FiInfo className="w-3 h-3" />
                    Nutrition info is shown on the customer-facing menu for health-conscious customers.
                  </p>
                </FormSection>
              </div>
            )}

            {/* ── TAB: Image ── */}
            {activeTab === 'image' && (
              <div className="space-y-4">
                <FormSection title="Item Image">
                  <ImagePicker
                    mode={form.imageMode}
                    url={form.imageUrl}
                    previewSrc={imagePreview}
                    onModeChange={mode => { set('imageMode', mode); clearImage(); }}
                    onUrlChange={url => { set('imageUrl', url); setImagePreview(url); }}
                    onFileChange={handleFileChange}
                    onClear={clearImage}
                  />
                </FormSection>
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
                  <strong>File upload:</strong> Image is uploaded to Cloudinary and a permanent URL is stored. Max 5 MB.<br />
                  <strong>URL:</strong> Paste any public image URL (e.g. from Unsplash). Stored directly — no re-upload.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex gap-2">
              {TABS.map((t, i) => (
                <button
                  key={t.id} type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`w-2 h-2 rounded-full transition-all ${activeTab === t.id ? 'bg-primary-500 w-6' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">
                {editItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { dispatch(deleteMenuItem(deleteTarget._id)); setDeleteTarget(null); }}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
      />

      {/* ── Category Management Modal ── */}
      <Modal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        title="Manage Categories"
        size="lg"
      >
        <div className="p-6 space-y-6">
          {/* Existing categories */}
          <div>
            <h4 className="text-sm font-semibold text-dark-500 mb-3">Existing Categories ({categories.length})</h4>
            {categories.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <p className="text-4xl mb-2">📂</p>
                <p className="text-sm text-gray-400">No categories yet. Create your first one below!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {categories.map(c => (
                  <div
                    key={c._id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
                    style={{ borderLeftColor: c.color || '#FF6B35', borderLeftWidth: 3 }}
                  >
                    {c.icon && <span className="text-lg">{c.icon}</span>}
                    <span className="text-sm font-medium text-dark-500 truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create new category form */}
          <form onSubmit={handleSaveCategory} className="space-y-4 border-t border-gray-100 pt-5">
            <h4 className="text-sm font-semibold text-dark-500">Add New Category</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Category Name *"
                value={catForm.name}
                onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Chinese, Starters, Desserts"
                required
              />
              <div>
                <label className="label">Icon (emoji)</label>
                <input
                  className="input-field"
                  value={catForm.icon}
                  onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="🍜 🍕 🍣 🍔"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={catForm.color}
                    onChange={e => setCatForm(f => ({ ...f, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="text-sm text-gray-500 font-mono">{catForm.color}</span>
                </div>
              </div>
              <Input
                label="Description (optional)"
                value={catForm.description}
                onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>

            {/* Preview */}
            {catForm.name && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-400">Preview:</span>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full text-white"
                  style={{ background: catForm.color }}
                >
                  {catForm.icon && <span>{catForm.icon}</span>}
                  {catForm.name}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => setShowCatModal(false)}>Close</Button>
              <Button type="submit" disabled={catSaving}>
                {catSaving ? 'Saving…' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}