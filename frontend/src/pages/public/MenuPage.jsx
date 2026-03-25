import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMenuItems, fetchCategories } from '../../store/slices/menuSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { selectCartItemCount } from '../../store/slices/cartSlice.js';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiStar, FiClock, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const QUICK_FILTERS = [
  { id: 'all',        label: '🍽 All',        filter: {} },
  { id: 'veg',        label: '🌿 Veg',        filter: { isVegetarian: true } },
  { id: 'nonveg',     label: '🍗 Non-Veg',    filter: { isVegetarian: false } },
  { id: 'vegan',      label: '🌱 Vegan',       filter: { isVegan: true } },
  { id: 'spicy',      label: '🌶 Spicy',       filter: { isSpicy: true } },
  { id: 'featured',   label: '⭐ Featured',   filter: { isFeatured: true } },
  { id: 'glutenfree', label: '🌾 Gluten-Free', filter: { isGlutenFree: true } },
];

export default function MenuPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, categories, isLoading } = useSelector(state => state.menu);
  const cartCount = useSelector(selectCartItemCount);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [activeQF, setActiveQF] = useState('all');
  const [priceSort, setPriceSort] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMenuItems({ isAvailable: true }));
  }, [dispatch]);

  const handleAddToCart = (item) => {
    dispatch(addToCart({ item }));
    toast.success(`${item.name} added!`, { icon: '🛒', duration: 1500 });
  };

  const qf = QUICK_FILTERS.find(f => f.id === activeQF)?.filter || {};

  const filtered = items
    .filter(item => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCat || item.category?._id === selectedCat;
      let matchQF = true;
      if (qf.isVegetarian === true)  matchQF = item.isVegetarian;
      if (qf.isVegetarian === false) matchQF = !item.isVegetarian;
      if (qf.isVegan)      matchQF = matchQF && item.isVegan;
      if (qf.isSpicy)      matchQF = matchQF && (item.isSpicy || item.spiceLevel > 0);
      if (qf.isFeatured)   matchQF = matchQF && item.isFeatured;
      if (qf.isGlutenFree) matchQF = matchQF && item.isGlutenFree;
      return matchSearch && matchCat && matchQF;
    })
    .sort((a, b) => {
      if (priceSort === 'asc')  return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
      if (priceSort === 'desc') return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
      return 0;
    });

  const hasFilters = search || selectedCat || activeQF !== 'all' || priceSort;
  const clearAll = () => { setSearch(''); setSelectedCat(''); setActiveQF('all'); setPriceSort(''); };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-dark-500 mb-4">Our <span className="text-gradient">Menu</span></h1>
          <p className="text-gray-500 text-lg">Freshly prepared with the finest ingredients</p>
        </motion.div>

        {/* Search + Sort + Cart */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input className="input-field pl-12 bg-white" placeholder="Search dishes, ingredients…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX className="w-4 h-4" /></button>}
          </div>
          <select value={priceSort} onChange={e => setPriceSort(e.target.value)} className="input-field bg-white sm:w-44 text-sm">
            <option value="">Sort: Default</option>
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>
          <button onClick={() => navigate('/cart')} className="relative flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap">
            <FiShoppingCart className="w-5 h-5" />
            View Cart
            {cartCount > 0 && <span className="bg-white text-primary-600 font-bold text-xs px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">{cartCount}</span>}
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex gap-2 flex-wrap mb-4">
          {QUICK_FILTERS.map(f => (
            <button key={f.id} onClick={() => setActiveQF(activeQF === f.id ? 'all' : f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeQF === f.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
            <button onClick={() => setSelectedCat('')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${!selectedCat ? 'bg-dark-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
              All Categories
            </button>
            {categories.map(cat => (
              <button key={cat._id} onClick={() => setSelectedCat(selectedCat === cat._id ? '' : cat._id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${selectedCat === cat._id ? 'text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
                style={selectedCat === cat._id ? { background: cat.color || '#FF6B35' } : {}}>
                {cat.icon && <span>{cat.icon}</span>}{cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Result count + clear */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">{isLoading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}</p>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1 font-medium">
              <FiX className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded" /><div className="h-8 bg-gray-200 rounded" /></div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(item => (
                <motion.div key={item._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="card overflow-hidden group flex flex-col">
                  <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-6xl">🍽</div>
                    }
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%]">
                      {item.isVegetarian
                        ? <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">🌿 Veg</span>
                        : <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">🍗 Non-Veg</span>
                      }
                      {item.isVegan && <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">🌱</span>}
                      {item.isFeatured && <span className="bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full font-medium">⭐</span>}
                    </div>
                    {item.discountedPrice && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {Math.round((1 - item.discountedPrice / item.price) * 100)}% OFF
                      </div>
                    )}
                    {item.spiceLevel > 0 && (
                      <div className="absolute bottom-2 left-3">
                        <span className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-md backdrop-blur-sm">{'🌶'.repeat(Math.min(item.spiceLevel, 3))}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-heading font-bold text-base text-dark-500 mb-1 line-clamp-1">{item.name}</h3>
                    {item.description && <p className="text-gray-400 text-xs mb-2 line-clamp-2 flex-1">{item.description}</p>}
                    {item.category && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mb-2 w-fit"
                        style={{ background: (item.category.color || '#FF6B35') + '20', color: item.category.color || '#FF6B35' }}>
                        {item.category.icon} {item.category.name}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                      {item.ratings?.count > 0 && <span className="flex items-center gap-1"><FiStar className="w-3 h-3 text-amber-400 fill-amber-400" />{item.ratings.average.toFixed(1)}</span>}
                      <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{item.preparationTime}m</span>
                      {item.isGlutenFree && <span className="text-purple-500 font-medium">GF</span>}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        {item.discountedPrice
                          ? <div><span className="font-heading font-bold text-xl text-primary-500">₹{item.discountedPrice}</span><span className="text-gray-300 text-sm line-through ml-1">₹{item.price}</span></div>
                          : <span className="font-heading font-bold text-xl text-dark-500">₹{item.price}</span>
                        }
                      </div>
                      <button onClick={() => handleAddToCart(item)}
                        className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5">
                        <FiShoppingCart className="w-4 h-4" />Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-heading font-bold text-2xl text-dark-500 mb-2">No items found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearAll} className="btn-primary text-sm">Clear All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
