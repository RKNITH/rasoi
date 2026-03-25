/**
 * seed.js — Rasoi Restaurant Seed Script
 * 
 * Usage:
 *   node seed.js           → seed categories + menu items
 *   node seed.js --clear   → wipe existing menu + categories first, then seed
 * 
 * Run from the backend folder:
 *   cd backend && node seed.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import MenuItem from './models/MenuItem.js';
import { Category } from './models/index.js';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
    { name: 'North Indian', icon: '🍛', color: '#FF6B35', description: 'Authentic curries, dals, rotis and rich gravies', sortOrder: 1 },
    { name: 'South Indian', icon: '🥘', color: '#FF9F1C', description: 'Dosas, idlis, sambhar and coconut-based dishes', sortOrder: 2 },
    { name: 'Chinese', icon: '🍜', color: '#E63946', description: 'Indo-Chinese stir-fries, noodles and Manchurian dishes', sortOrder: 3 },
    { name: 'Fast Food', icon: '🍔', color: '#F4A261', description: 'Burgers, fries, wraps and quick bites', sortOrder: 4 },
    { name: 'Starters', icon: '🥗', color: '#2A9D8F', description: 'Appetisers, tikkas, kebabs and soups', sortOrder: 5 },
    { name: 'Breads', icon: '🫓', color: '#E9C46A', description: 'Naan, roti, paratha, kulcha and more', sortOrder: 6 },
    { name: 'Rice & Biryani', icon: '🍚', color: '#8338EC', description: 'Fragrant biryanis, pulao and rice bowls', sortOrder: 7 },
    { name: 'Desserts', icon: '🍮', color: '#F72585', description: 'Traditional sweets, ice creams and fusion desserts', sortOrder: 8 },
    { name: 'Beverages', icon: '🥤', color: '#4CC9F0', description: 'Lassi, chaas, juices, shakes and hot drinks', sortOrder: 9 },
    { name: 'Thali', icon: '🍽', color: '#06D6A0', description: 'Complete meal combos — veg and non-veg thalis', sortOrder: 10 },
];

// ─── Image URLs (free Unsplash / Pexels direct URLs) ──────────────────────────
// Each URL points to a real food photo — no upload needed, stored as-is.
const IMGS = {
    butterChicken: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
    dalMakhani: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    paneerTikka: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
    chickenBiryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
    vegBiryani: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80',
    dosa: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80',
    idliSambhar: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80',
    noodles: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80',
    friedRice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
    manchurian: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&q=80',
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
    wrap: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80',
    soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    seekhKebab: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
    naan: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80',
    paratha: 'https://images.unsplash.com/photo-1616299915952-04c803388e5b?w=600&q=80',
    gulab: 'https://images.unsplash.com/photo-1601302289413-68e5498d21e5?w=600&q=80',
    kheer: 'https://images.unsplash.com/photo-1590080877096-04b0e150f9d7?w=600&q=80',
    lassi: 'https://images.unsplash.com/photo-1571006682257-1b5b2a62e7a9?w=600&q=80',
    chai: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=600&q=80',
    thali: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
    palakPaneer: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    rajma: 'https://images.unsplash.com/photo-1613408894545-c6c3e5c7d7ef?w=600&q=80',
    spring: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=600&q=80',
    sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
    mango: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80',
};

// ─── Menu items factory (takes category map: name→id) ────────────────────────
const buildMenuItems = (catMap, adminId) => [

    // ── North Indian ──────────────────────────────────────────────────────────
    {
        name: 'Butter Chicken', category: catMap['North Indian'],
        description: 'Tender chicken in a rich, creamy tomato-butter gravy. Mildly spiced and absolutely comforting.',
        price: 230, discountedPrice: 199, image: IMGS.butterChicken,
        isVegetarian: false, isSpicy: false, spiceLevel: 1, isFeatured: true, preparationTime: 20,
        ingredients: ['Chicken', 'Tomato', 'Butter', 'Cream', 'Kashmiri Chilli', 'Garam Masala'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 380, protein: 28, carbs: 18, fat: 22 },
        tags: ['bestseller', 'non-veg', 'gravy'], createdBy: adminId
    },
    {
        name: 'Dal Makhani', category: catMap['North Indian'],
        description: 'Black lentils slow-cooked overnight with butter and cream. The ultimate Punjabi comfort dal.',
        price: 160, image: IMGS.dalMakhani,
        isVegetarian: true, isSpicy: false, spiceLevel: 1, isFeatured: true, preparationTime: 25,
        ingredients: ['Black Lentils', 'Kidney Beans', 'Butter', 'Cream', 'Tomato', 'Ginger'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 295, protein: 14, carbs: 34, fat: 12 },
        tags: ['bestseller', 'veg', 'gravy'], createdBy: adminId
    },
    {
        name: 'Palak Paneer', category: catMap['North Indian'],
        description: 'Fresh cottage cheese cubes in a smooth, spiced spinach gravy. Healthy and delicious.',
        price: 190, image: IMGS.palakPaneer,
        isVegetarian: true, isSpicy: false, spiceLevel: 1, isFeatured: false, preparationTime: 20,
        ingredients: ['Paneer', 'Spinach', 'Onion', 'Tomato', 'Cream', 'Spices'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 310, protein: 16, carbs: 20, fat: 18 },
        tags: ['veg', 'healthy', 'gravy'], createdBy: adminId
    },
    {
        name: 'Rajma Masala', category: catMap['North Indian'],
        description: 'Red kidney beans in a thick, spiced tomato-onion gravy. Best enjoyed with steamed rice.',
        price: 150, image: IMGS.rajma,
        isVegetarian: true, isVegan: true, isGlutenFree: true, isSpicy: false, spiceLevel: 2,
        preparationTime: 20,
        ingredients: ['Kidney Beans', 'Tomato', 'Onion', 'Ginger-Garlic', 'Spices'],
        allergens: [],
        nutritionInfo: { calories: 280, protein: 13, carbs: 40, fat: 8 },
        tags: ['veg', 'vegan', 'gluten-free'], createdBy: adminId
    },
    {
        name: 'Chicken Curry', category: catMap['North Indian'],
        description: 'Home-style chicken curry in a rich onion-tomato masala. Goes perfectly with roti or rice.',
        price: 210, image: IMGS.butterChicken,
        isVegetarian: false, isSpicy: true, spiceLevel: 3, preparationTime: 25,
        ingredients: ['Chicken', 'Onion', 'Tomato', 'Whole Spices', 'Ginger-Garlic', 'Coriander'],
        allergens: [],
        nutritionInfo: { calories: 340, protein: 30, carbs: 14, fat: 18 },
        tags: ['non-veg', 'spicy', 'gravy'], createdBy: adminId
    },

    // ── South Indian ──────────────────────────────────────────────────────────
    {
        name: 'Masala Dosa', category: catMap['South Indian'],
        description: 'Crispy rice crepe stuffed with spiced potato filling. Served with coconut chutney and sambhar.',
        price: 120, image: IMGS.dosa,
        isVegetarian: true, isVegan: false, isSpicy: false, spiceLevel: 1,
        isFeatured: true, preparationTime: 15,
        ingredients: ['Rice', 'Urad Dal', 'Potato', 'Onion', 'Mustard Seeds', 'Curry Leaves'],
        allergens: [],
        nutritionInfo: { calories: 320, protein: 8, carbs: 52, fat: 10 },
        tags: ['veg', 'breakfast', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Idli Sambhar (4 pcs)', category: catMap['South Indian'],
        description: 'Soft, steamed rice cakes served with piping hot sambhar and fresh chutneys.',
        price: 90, image: IMGS.idliSambhar,
        isVegetarian: true, isVegan: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0,
        preparationTime: 10,
        ingredients: ['Rice', 'Urad Dal', 'Lentils', 'Tomato', 'Tamarind', 'Vegetables'],
        allergens: [],
        nutritionInfo: { calories: 220, protein: 8, carbs: 42, fat: 3 },
        tags: ['veg', 'breakfast', 'light', 'healthy'], createdBy: adminId
    },
    {
        name: 'Medu Vada (2 pcs)', category: catMap['South Indian'],
        description: 'Crispy donut-shaped lentil fritters with a soft interior. Classic South Indian snack.',
        price: 80, image: IMGS.idliSambhar,
        isVegetarian: true, isSpicy: false, spiceLevel: 1, preparationTime: 12,
        ingredients: ['Urad Dal', 'Onion', 'Green Chilli', 'Curry Leaves', 'Ginger'],
        allergens: [],
        nutritionInfo: { calories: 190, protein: 7, carbs: 28, fat: 7 },
        tags: ['veg', 'snack', 'breakfast'], createdBy: adminId
    },
    {
        name: 'Uttapam', category: catMap['South Indian'],
        description: 'Thick rice pancake topped with onions, tomatoes, and green chillies. A filling morning meal.',
        price: 110, image: IMGS.dosa,
        isVegetarian: true, isVegan: true, isSpicy: false, spiceLevel: 1, preparationTime: 15,
        ingredients: ['Rice Batter', 'Onion', 'Tomato', 'Green Chilli', 'Coriander'],
        allergens: [],
        nutritionInfo: { calories: 260, protein: 7, carbs: 46, fat: 6 },
        tags: ['veg', 'breakfast'], createdBy: adminId
    },

    // ── Chinese ───────────────────────────────────────────────────────────────
    {
        name: 'Hakka Noodles (Veg)', category: catMap['Chinese'],
        description: 'Stir-fried noodles tossed with crisp vegetables and Indo-Chinese sauces. Always a hit.',
        price: 140, discountedPrice: 120, image: IMGS.noodles,
        isVegetarian: true, isSpicy: true, spiceLevel: 2,
        isFeatured: true, preparationTime: 15,
        ingredients: ['Noodles', 'Cabbage', 'Carrot', 'Capsicum', 'Soy Sauce', 'Vinegar', 'Spring Onion'],
        allergens: ['Gluten', 'Soy'],
        nutritionInfo: { calories: 350, protein: 9, carbs: 58, fat: 8 },
        tags: ['veg', 'chinese', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Chicken Hakka Noodles', category: catMap['Chinese'],
        description: 'Wok-tossed noodles with juicy chicken strips and crunchy vegetables in smoky sauces.',
        price: 180, image: IMGS.noodles,
        isVegetarian: false, isSpicy: true, spiceLevel: 2, preparationTime: 18,
        ingredients: ['Noodles', 'Chicken', 'Cabbage', 'Capsicum', 'Soy Sauce', 'Chilli Sauce'],
        allergens: ['Gluten', 'Soy'],
        nutritionInfo: { calories: 420, protein: 24, carbs: 55, fat: 12 },
        tags: ['non-veg', 'chinese'], createdBy: adminId
    },
    {
        name: 'Veg Manchurian (Gravy)', category: catMap['Chinese'],
        description: 'Crispy veggie balls in a tangy, garlicky Indo-Chinese gravy. The ultimate party starter.',
        price: 150, image: IMGS.manchurian,
        isVegetarian: true, isSpicy: true, spiceLevel: 3, preparationTime: 20,
        ingredients: ['Mixed Veg', 'Garlic', 'Ginger', 'Soy Sauce', 'Cornflour', 'Spring Onion'],
        allergens: ['Gluten', 'Soy'],
        nutritionInfo: { calories: 300, protein: 8, carbs: 42, fat: 10 },
        tags: ['veg', 'chinese', 'spicy'], createdBy: adminId
    },
    {
        name: 'Veg Fried Rice', category: catMap['Chinese'],
        description: 'Classic wok-tossed rice with seasonal vegetables and soy. Light, flavourful, satisfying.',
        price: 130, discountedPrice: 110, image: IMGS.friedRice,
        isVegetarian: true, isGlutenFree: false, isSpicy: false, spiceLevel: 1, preparationTime: 15,
        ingredients: ['Rice', 'Carrot', 'Beans', 'Capsicum', 'Spring Onion', 'Soy Sauce'],
        allergens: ['Soy'],
        nutritionInfo: { calories: 380, protein: 8, carbs: 65, fat: 9 },
        tags: ['veg', 'chinese'], createdBy: adminId
    },
    {
        name: 'Chicken Fried Rice', category: catMap['Chinese'],
        description: 'Aromatic rice stir-fried with tender chicken, egg, and vegetables in smoky soy sauce.',
        price: 170, image: IMGS.friedRice,
        isVegetarian: false, isSpicy: false, spiceLevel: 1, preparationTime: 18,
        ingredients: ['Rice', 'Chicken', 'Egg', 'Spring Onion', 'Soy Sauce', 'Ginger-Garlic'],
        allergens: ['Soy', 'Egg'],
        nutritionInfo: { calories: 450, protein: 26, carbs: 60, fat: 13 },
        tags: ['non-veg', 'chinese'], createdBy: adminId
    },
    {
        name: 'Spring Rolls (4 pcs)', category: catMap['Chinese'],
        description: 'Crispy golden rolls stuffed with spiced vegetables. Perfect starter with chilli dip.',
        price: 120, image: IMGS.spring,
        isVegetarian: true, isSpicy: false, spiceLevel: 1, preparationTime: 15,
        ingredients: ['Spring Roll Sheet', 'Cabbage', 'Carrot', 'Capsicum', 'Noodles'],
        allergens: ['Gluten'],
        nutritionInfo: { calories: 260, protein: 6, carbs: 38, fat: 10 },
        tags: ['veg', 'starter', 'chinese'], createdBy: adminId
    },
    {
        name: 'Chilli Paneer (Dry)', category: catMap['Chinese'],
        description: 'Crispy paneer tossed with bell peppers and onions in a bold Indo-Chinese chilli sauce.',
        price: 180, image: IMGS.manchurian,
        isVegetarian: true, isSpicy: true, spiceLevel: 3, preparationTime: 20,
        ingredients: ['Paneer', 'Capsicum', 'Onion', 'Garlic', 'Chilli Sauce', 'Soy Sauce', 'Cornflour'],
        allergens: ['Dairy', 'Soy', 'Gluten'],
        nutritionInfo: { calories: 340, protein: 16, carbs: 30, fat: 18 },
        tags: ['veg', 'chinese', 'spicy'], createdBy: adminId
    },

    // ── Fast Food ─────────────────────────────────────────────────────────────
    {
        name: 'Veg Burger', category: catMap['Fast Food'],
        description: 'A crispy veggie patty loaded with fresh lettuce, tomato, and our signature house sauce in a soft sesame bun.',
        price: 90, image: IMGS.burger,
        isVegetarian: true, isSpicy: false, spiceLevel: 0, preparationTime: 10,
        ingredients: ['Veg Patty', 'Lettuce', 'Tomato', 'Onion', 'Cheese', 'Bun', 'House Sauce'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 280, protein: 10, carbs: 38, fat: 9 },
        tags: ['veg', 'fast-food'], createdBy: adminId
    },
    {
        name: 'Chicken Burger', category: catMap['Fast Food'],
        description: 'Grilled or crispy fried chicken fillet in a toasted bun with coleslaw and garlic mayo.',
        price: 130, discountedPrice: 110, image: IMGS.burger,
        isVegetarian: false, isSpicy: false, spiceLevel: 1, isFeatured: true, preparationTime: 12,
        ingredients: ['Chicken Fillet', 'Coleslaw', 'Garlic Mayo', 'Tomato', 'Lettuce', 'Sesame Bun'],
        allergens: ['Gluten', 'Egg', 'Dairy'],
        nutritionInfo: { calories: 380, protein: 26, carbs: 40, fat: 14 },
        tags: ['non-veg', 'fast-food', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Masala French Fries', category: catMap['Fast Food'],
        description: 'Golden crispy fries tossed in our secret masala blend with a squeeze of lemon.',
        price: 80, discountedPrice: 65, image: IMGS.fries,
        isVegetarian: true, isVegan: true, isGlutenFree: true, isSpicy: true, spiceLevel: 2,
        preparationTime: 10,
        ingredients: ['Potato', 'Masala Spice Mix', 'Oil', 'Lemon', 'Coriander'],
        allergens: [],
        nutritionInfo: { calories: 260, protein: 4, carbs: 40, fat: 10 },
        tags: ['veg', 'fast-food', 'snack', 'spicy'], createdBy: adminId
    },
    {
        name: 'Veg Wrap', category: catMap['Fast Food'],
        description: 'Spiced paneer and veggies wrapped in a whole-wheat roti with mint chutney and onion rings.',
        price: 110, image: IMGS.wrap,
        isVegetarian: true, isSpicy: false, spiceLevel: 1, preparationTime: 12,
        ingredients: ['Whole Wheat Roti', 'Paneer', 'Capsicum', 'Onion', 'Mint Chutney', 'Spices'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 310, protein: 13, carbs: 44, fat: 9 },
        tags: ['veg', 'fast-food', 'wrap'], createdBy: adminId
    },
    {
        name: 'Grilled Sandwich', category: catMap['Fast Food'],
        description: 'Grilled sandwich loaded with fresh vegetables and cheese. Crispy outside, gooey inside.',
        price: 90, image: IMGS.sandwich,
        isVegetarian: true, isSpicy: false, spiceLevel: 0, preparationTime: 10,
        ingredients: ['Bread', 'Cheese', 'Tomato', 'Capsicum', 'Onion', 'Green Chutney', 'Butter'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 270, protein: 10, carbs: 36, fat: 10 },
        tags: ['veg', 'fast-food', 'snack'], createdBy: adminId
    },

    // ── Starters ──────────────────────────────────────────────────────────────
    {
        name: 'Paneer Tikka', category: catMap['Starters'],
        description: 'Marinated cottage cheese cubes grilled in a tandoor with peppers and onions. Classic starter.',
        price: 180, image: IMGS.paneerTikka,
        isVegetarian: true, isSpicy: true, spiceLevel: 2,
        isFeatured: true, preparationTime: 20,
        ingredients: ['Paneer', 'Yoghurt', 'Capsicum', 'Onion', 'Tandoori Masala', 'Ginger-Garlic'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 290, protein: 18, carbs: 12, fat: 18 },
        tags: ['veg', 'starter', 'tandoor', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Seekh Kebab (4 pcs)', category: catMap['Starters'],
        description: 'Minced chicken skewers with herbs and spices, grilled on charcoal for a smoky flavour.',
        price: 200, image: IMGS.seekhKebab,
        isVegetarian: false, isSpicy: true, spiceLevel: 2, preparationTime: 22,
        ingredients: ['Chicken Mince', 'Onion', 'Green Chilli', 'Coriander', 'Tandoori Masala'],
        allergens: [],
        nutritionInfo: { calories: 310, protein: 28, carbs: 8, fat: 18 },
        tags: ['non-veg', 'starter', 'tandoor'], createdBy: adminId
    },
    {
        name: 'Tomato Soup', category: catMap['Starters'],
        description: 'Creamy, velvety tomato soup with fresh cream and a hint of basil. Warm and comforting.',
        price: 90, image: IMGS.soup,
        isVegetarian: true, isSpicy: false, spiceLevel: 0, isGlutenFree: true, preparationTime: 10,
        ingredients: ['Tomato', 'Onion', 'Cream', 'Basil', 'Butter', 'Pepper'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 140, protein: 3, carbs: 16, fat: 7 },
        tags: ['veg', 'soup', 'healthy'], createdBy: adminId
    },
    {
        name: 'Chicken 65', category: catMap['Starters'],
        description: 'Deep-fried chicken marinated in spicy yoghurt batter. Crispy, fiery, and utterly addictive.',
        price: 190, image: IMGS.seekhKebab,
        isVegetarian: false, isSpicy: true, spiceLevel: 4, preparationTime: 20,
        ingredients: ['Chicken', 'Yoghurt', 'Red Chilli', 'Curry Leaves', 'Ginger-Garlic', 'Cornflour'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 350, protein: 26, carbs: 18, fat: 20 },
        tags: ['non-veg', 'starter', 'spicy', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Aloo Tikki (2 pcs)', category: catMap['Starters'],
        description: 'Crispy spiced potato patties served with mint chutney and tamarind sauce.',
        price: 80, image: IMGS.soup,
        isVegetarian: true, isVegan: true, isGlutenFree: true, isSpicy: false, spiceLevel: 1,
        preparationTime: 12,
        ingredients: ['Potato', 'Green Peas', 'Ginger', 'Green Chilli', 'Spices', 'Chutney'],
        allergens: [],
        nutritionInfo: { calories: 200, protein: 5, carbs: 32, fat: 7 },
        tags: ['veg', 'starter', 'snack'], createdBy: adminId
    },

    // ── Breads ────────────────────────────────────────────────────────────────
    {
        name: 'Butter Naan', category: catMap['Breads'],
        description: 'Soft, pillowy flatbread baked fresh in the tandoor and brushed with generous butter.',
        price: 40, image: IMGS.naan,
        isVegetarian: true, isSpicy: false, spiceLevel: 0, preparationTime: 10,
        ingredients: ['Refined Flour', 'Yoghurt', 'Butter', 'Yeast', 'Salt'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 200, protein: 6, carbs: 34, fat: 7 },
        tags: ['veg', 'bread'], createdBy: adminId
    },
    {
        name: 'Garlic Naan', category: catMap['Breads'],
        description: 'Tandoor-baked naan topped with fresh garlic and coriander. Pairs perfectly with any gravy.',
        price: 50, image: IMGS.naan,
        isVegetarian: true, isSpicy: false, spiceLevel: 0, preparationTime: 10,
        ingredients: ['Refined Flour', 'Garlic', 'Butter', 'Coriander', 'Yoghurt'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 210, protein: 6, carbs: 34, fat: 7 },
        tags: ['veg', 'bread', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Tandoori Roti', category: catMap['Breads'],
        description: 'Whole wheat flatbread baked in a clay tandoor. Healthy and flavourful, no oil added.',
        price: 30, image: IMGS.naan,
        isVegetarian: true, isVegan: true, isSpicy: false, spiceLevel: 0, preparationTime: 8,
        ingredients: ['Whole Wheat Flour', 'Water', 'Salt'],
        allergens: ['Gluten'],
        nutritionInfo: { calories: 130, protein: 4, carbs: 26, fat: 1 },
        tags: ['veg', 'bread', 'healthy'], createdBy: adminId
    },
    {
        name: 'Aloo Paratha (2 pcs)', category: catMap['Breads'],
        description: 'Whole wheat flatbread stuffed with spiced mashed potato. Served with butter and pickle.',
        price: 90, image: IMGS.paratha,
        isVegetarian: true, isSpicy: false, spiceLevel: 1, isFeatured: false, preparationTime: 15,
        ingredients: ['Whole Wheat Flour', 'Potato', 'Onion', 'Green Chilli', 'Coriander', 'Butter'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 320, protein: 8, carbs: 52, fat: 10 },
        tags: ['veg', 'bread', 'breakfast'], createdBy: adminId
    },

    // ── Rice & Biryani ────────────────────────────────────────────────────────
    {
        name: 'Chicken Biryani', category: catMap['Rice & Biryani'],
        description: 'Bone-in chicken marinated in yoghurt and spices, slow-cooked with fragrant basmati. Served with salan and raita.',
        price: 250, discountedPrice: 220, image: IMGS.chickenBiryani,
        isVegetarian: false, isSpicy: true, spiceLevel: 3, isFeatured: true, preparationTime: 35,
        ingredients: ['Chicken', 'Basmati Rice', 'Yoghurt', 'Saffron', 'Fried Onion', 'Whole Spices', 'Mint'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 520, protein: 36, carbs: 62, fat: 18 },
        tags: ['non-veg', 'biryani', 'bestseller', 'chef-special'], createdBy: adminId
    },
    {
        name: 'Veg Biryani', category: catMap['Rice & Biryani'],
        description: 'Fragrant basmati rice layered with seasonal vegetables and whole spices. Served with raita.',
        price: 180, image: IMGS.vegBiryani,
        isVegetarian: true, isSpicy: false, spiceLevel: 2, isFeatured: true, preparationTime: 30,
        ingredients: ['Basmati Rice', 'Mixed Veg', 'Saffron', 'Whole Spices', 'Mint', 'Fried Onion'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 420, protein: 10, carbs: 68, fat: 14 },
        tags: ['veg', 'biryani', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Mutton Biryani', category: catMap['Rice & Biryani'],
        description: 'Tender mutton pieces slow-cooked with aromatic spices and basmati rice. A true indulgence.',
        price: 300, discountedPrice: 270, image: IMGS.chickenBiryani,
        isVegetarian: false, isSpicy: true, spiceLevel: 3, isFeatured: true, preparationTime: 45,
        ingredients: ['Mutton', 'Basmati Rice', 'Yoghurt', 'Saffron', 'Kewra Water', 'Whole Spices'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 580, protein: 40, carbs: 60, fat: 24 },
        tags: ['non-veg', 'biryani', 'premium', 'chef-special'], createdBy: adminId
    },
    {
        name: 'Paneer Biryani', category: catMap['Rice & Biryani'],
        description: 'Fragrant rice with marinated paneer pieces and whole spices. The vegetarian biryani lovers dream.',
        price: 200, image: IMGS.vegBiryani,
        isVegetarian: true, isSpicy: false, spiceLevel: 2, preparationTime: 30,
        ingredients: ['Basmati Rice', 'Paneer', 'Yoghurt', 'Saffron', 'Whole Spices', 'Mint'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 460, protein: 18, carbs: 64, fat: 16 },
        tags: ['veg', 'biryani'], createdBy: adminId
    },
    {
        name: 'Jeera Rice', category: catMap['Rice & Biryani'],
        description: 'Basmati rice tempered with cumin seeds, ghee and fresh coriander. Simple and fragrant.',
        price: 100, image: IMGS.friedRice,
        isVegetarian: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0, preparationTime: 12,
        ingredients: ['Basmati Rice', 'Cumin Seeds', 'Ghee', 'Coriander'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 280, protein: 5, carbs: 52, fat: 7 },
        tags: ['veg', 'rice', 'healthy'], createdBy: adminId
    },

    // ── Desserts ──────────────────────────────────────────────────────────────
    {
        name: 'Gulab Jamun (2 pcs)', category: catMap['Desserts'],
        description: 'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup. India\'s most loved sweet.',
        price: 70, image: IMGS.gulab,
        isVegetarian: true, isSpicy: false, spiceLevel: 0, isFeatured: true, preparationTime: 5,
        ingredients: ['Milk Solids', 'Refined Flour', 'Sugar', 'Rose Water', 'Cardamom'],
        allergens: ['Dairy', 'Gluten'],
        nutritionInfo: { calories: 220, protein: 4, carbs: 40, fat: 6 },
        tags: ['veg', 'dessert', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Rice Kheer', category: catMap['Desserts'],
        description: 'Slow-cooked rice pudding with milk, sugar, cardamom and garnished with pistachios.',
        price: 80, image: IMGS.kheer,
        isVegetarian: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0, preparationTime: 5,
        ingredients: ['Rice', 'Full-Fat Milk', 'Sugar', 'Cardamom', 'Saffron', 'Pistachio'],
        allergens: ['Dairy', 'Nuts'],
        nutritionInfo: { calories: 250, protein: 6, carbs: 42, fat: 8 },
        tags: ['veg', 'dessert', 'gluten-free'], createdBy: adminId
    },
    {
        name: 'Gajar Halwa', category: catMap['Desserts'],
        description: 'Slow-cooked carrot pudding with ghee, sugar, milk and topped with cashews. Winter special.',
        price: 90, image: IMGS.kheer,
        isVegetarian: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0, preparationTime: 5,
        ingredients: ['Carrot', 'Ghee', 'Milk', 'Sugar', 'Cardamom', 'Cashew', 'Raisin'],
        allergens: ['Dairy', 'Nuts'],
        nutritionInfo: { calories: 290, protein: 5, carbs: 46, fat: 10 },
        tags: ['veg', 'dessert', 'seasonal'], createdBy: adminId
    },
    {
        name: 'Kulfi (Malai)', category: catMap['Desserts'],
        description: 'Traditional Indian frozen dessert made from condensed milk. Rich, creamy, and utterly indulgent.',
        price: 80, image: IMGS.kheer,
        isVegetarian: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0, preparationTime: 3,
        ingredients: ['Full-Fat Milk', 'Condensed Milk', 'Cream', 'Cardamom', 'Pistachio'],
        allergens: ['Dairy', 'Nuts'],
        nutritionInfo: { calories: 230, protein: 5, carbs: 30, fat: 10 },
        tags: ['veg', 'dessert', 'ice-cream'], createdBy: adminId
    },

    // ── Beverages ─────────────────────────────────────────────────────────────
    {
        name: 'Sweet Lassi', category: catMap['Beverages'],
        description: 'Chilled yoghurt drink sweetened with sugar and flavoured with cardamom. Classic and refreshing.',
        price: 70, image: IMGS.lassi,
        isVegetarian: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0, preparationTime: 5,
        ingredients: ['Yoghurt', 'Sugar', 'Cardamom', 'Rose Water', 'Milk'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 180, protein: 6, carbs: 28, fat: 5 },
        tags: ['veg', 'beverage', 'cold'], createdBy: adminId
    },
    {
        name: 'Mango Lassi', category: catMap['Beverages'],
        description: 'Thick and creamy lassi blended with fresh Alphonso mango pulp. Summer in a glass.',
        price: 90, image: IMGS.mango,
        isVegetarian: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0,
        isFeatured: true, preparationTime: 5,
        ingredients: ['Yoghurt', 'Mango Pulp', 'Sugar', 'Milk', 'Cardamom'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 220, protein: 6, carbs: 38, fat: 5 },
        tags: ['veg', 'beverage', 'cold', 'seasonal', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Masala Chai', category: catMap['Beverages'],
        description: 'Freshly brewed Indian spiced tea with ginger, cardamom, and whole spices. The perfect pick-me-up.',
        price: 30, image: IMGS.chai,
        isVegetarian: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0, preparationTime: 5,
        ingredients: ['Tea Leaves', 'Milk', 'Ginger', 'Cardamom', 'Sugar', 'Cloves'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 80, protein: 2, carbs: 12, fat: 3 },
        tags: ['veg', 'beverage', 'hot', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Fresh Lime Soda', category: catMap['Beverages'],
        description: 'Freshly squeezed lime with chilled soda, sugar, and a pinch of black salt. Utterly refreshing.',
        price: 50, image: IMGS.mango,
        isVegetarian: true, isVegan: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0,
        preparationTime: 3,
        ingredients: ['Lime', 'Soda Water', 'Sugar', 'Black Salt', 'Mint'],
        allergens: [],
        nutritionInfo: { calories: 50, protein: 0, carbs: 12, fat: 0 },
        tags: ['veg', 'vegan', 'beverage', 'cold', 'healthy'], createdBy: adminId
    },
    {
        name: 'Cold Coffee', category: catMap['Beverages'],
        description: 'Chilled coffee blended with milk, ice cream and a dash of chocolate. A café favourite.',
        price: 80, image: IMGS.mango,
        isVegetarian: true, isGlutenFree: true, isSpicy: false, spiceLevel: 0, preparationTime: 5,
        ingredients: ['Coffee', 'Milk', 'Ice Cream', 'Sugar', 'Ice', 'Chocolate Syrup'],
        allergens: ['Dairy'],
        nutritionInfo: { calories: 200, protein: 5, carbs: 28, fat: 8 },
        tags: ['veg', 'beverage', 'cold'], createdBy: adminId
    },

    // ── Thali ─────────────────────────────────────────────────────────────────
    {
        name: 'Rasoi Special Veg Thali', category: catMap['Thali'],
        description: 'A complete vegetarian feast: 2 sabzi, dal, rice, 2 roti, salad, papad, pickle, and gulab jamun.',
        price: 200, discountedPrice: 175, image: IMGS.thali,
        isVegetarian: true, isSpicy: false, spiceLevel: 1, isFeatured: true, preparationTime: 20,
        ingredients: ['Seasonal Sabzi', 'Dal', 'Rice', 'Roti', 'Salad', 'Raita', 'Papad', 'Pickle', 'Sweet'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 700, protein: 22, carbs: 110, fat: 20 },
        tags: ['veg', 'thali', 'value', 'complete-meal', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Rasoi Non-Veg Thali', category: catMap['Thali'],
        description: 'A generous non-veg spread: chicken curry, dal, rice, 2 roti, salad, papad, pickle, and kheer.',
        price: 280, discountedPrice: 250, image: IMGS.thali,
        isVegetarian: false, isSpicy: true, spiceLevel: 2, isFeatured: true, preparationTime: 25,
        ingredients: ['Chicken Curry', 'Dal', 'Rice', 'Roti', 'Salad', 'Raita', 'Papad', 'Pickle', 'Sweet'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 850, protein: 45, carbs: 105, fat: 28 },
        tags: ['non-veg', 'thali', 'value', 'complete-meal', 'bestseller'], createdBy: adminId
    },
    {
        name: 'Mini Tiffin (Lunch Box)', category: catMap['Thali'],
        description: 'Perfect compact meal for one: sabzi, dal, 2 roti, and rice. Light and wholesome.',
        price: 120, image: IMGS.thali,
        isVegetarian: true, isSpicy: false, spiceLevel: 1, preparationTime: 15,
        ingredients: ['Seasonal Sabzi', 'Dal', 'Roti', 'Rice'],
        allergens: ['Gluten', 'Dairy'],
        nutritionInfo: { calories: 480, protein: 14, carbs: 82, fat: 12 },
        tags: ['veg', 'thali', 'lunch', 'light'], createdBy: adminId
    },
];

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
    const shouldClear = process.argv.includes('--clear');
    console.log('\n🌱 Rasoi Seed Script Starting...\n');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        if (shouldClear) {
            console.log('🗑  Clearing existing data...');
            await MenuItem.deleteMany({});
            await Category.deleteMany({});
            console.log('   → All menu items deleted');
            console.log('   → All categories deleted\n');
        }

        // ── Seed categories ────────────────────────────────────────────────────
        console.log('📂 Seeding categories...');
        const catMap = {};
        for (const cat of CATEGORIES) {
            const existing = await Category.findOne({ name: cat.name });
            if (existing) {
                catMap[cat.name] = existing._id;
                console.log(`   ⏭  Skipped (exists): ${cat.icon} ${cat.name}`);
            } else {
                const created = await Category.create(cat);
                catMap[cat.name] = created._id;
                console.log(`   ✅ Created: ${cat.icon} ${cat.name}`);
            }
        }

        // ── Seed menu items ────────────────────────────────────────────────────
        console.log('\n🍽  Seeding menu items...');
        // Use a placeholder ObjectId for createdBy (replace with real admin _id if needed)
        const placeholderAdminId = new mongoose.Types.ObjectId();
        const menuItems = buildMenuItems(catMap, placeholderAdminId);

        let created = 0, skipped = 0;
        for (const item of menuItems) {
            const existing = await MenuItem.findOne({ name: item.name });
            if (existing) {
                skipped++;
                console.log(`   ⏭  Skipped (exists): ${item.name}`);
            } else {
                await MenuItem.create(item);
                created++;
                console.log(`   ✅ ${item.name} (${item.isVegetarian ? '🌿' : '🍗'}) — ₹${item.discountedPrice || item.price}`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Categories : ${Object.keys(catMap).length} total`);
        console.log(`   Items created : ${created}`);
        console.log(`   Items skipped : ${skipped}`);
        console.log(`\n🎉 Seeding complete!\n`);

    } catch (err) {
        console.error('\n❌ Seed error:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();