import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addToCart, removeFromCart, updateQuantity, clearCart,
  setOrderType, setSpecialInstructions,
  selectCartTotal, selectCartItemCount
} from '../../store/slices/cartSlice.js';
import { placeOrder } from '../../store/slices/orderSlice.js';
import { useAuth } from '../../hooks/index.js';
import {
  FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft,
  FiPackage, FiTruck, FiHome, FiCreditCard
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ORDER_TYPES = [
  { value: 'dine-in', label: 'Dine In', icon: FiHome, desc: 'Eat at the restaurant' },
  { value: 'takeaway', label: 'Takeaway', icon: FiPackage, desc: 'Pick up your order' },
  { value: 'delivery', label: 'Delivery', icon: FiTruck, desc: 'Delivered to you' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'online', label: 'Online' },
];

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const cartItems = useSelector(s => s.cart.items);
  const orderType = useSelector(s => s.cart.orderType);
  const specialInstructions = useSelector(s => s.cart.specialInstructions);
  const total = useSelector(selectCartTotal);
  const itemCount = useSelector(selectCartItemCount);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  const tax = total * 0.05;
  const deliveryCharge = orderType === 'delivery' ? 40 : 0;
  const grandTotal = total + tax + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return toast.error('Cart is empty');
    if (!customerName.trim() && !isAuthenticated) return toast.error('Please enter your name');
    if (orderType === 'delivery' && !deliveryAddress.trim()) return toast.error('Please enter delivery address');

    setPlacing(true);
    const orderData = {
      items: cartItems.map(i => ({ menuItem: i.menuItem, quantity: i.quantity, specialInstructions: i.specialInstructions })),
      orderType,
      paymentMethod,
      specialInstructions,
      customerName: !isAuthenticated ? customerName : undefined,
      customerPhone: !isAuthenticated ? customerPhone : undefined,
      customerEmail: !isAuthenticated ? customerEmail : undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
    };

    const res = await dispatch(placeOrder(orderData));
    setPlacing(false);
    if (placeOrder.fulfilled.match(res)) {
      dispatch(clearCart());
      toast.success('🎉 Order placed successfully!');
      if (isAuthenticated && user?.role === 'customer') {
        navigate('/customer/orders');
      } else if (isAuthenticated) {
        navigate('/menu');
      } else {
        navigate('/');
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="font-heading text-3xl font-bold text-dark-500 mb-3">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Add some delicious items from our menu!</p>
            <button onClick={() => navigate('/menu')} className="btn-primary inline-flex items-center gap-2">
              <FiArrowLeft className="w-4 h-4" /> Browse Menu
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/menu')} className="p-2 rounded-xl hover:bg-white hover:shadow transition-all text-gray-500 hover:text-primary-500">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-3xl font-bold text-dark-500">Your Cart</h1>
            <p className="text-gray-400 text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''} in your order</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Items + Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-dark-500 mb-4">Order Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {ORDER_TYPES.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => dispatch(setOrderType(value))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      orderType === value
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-xs text-center leading-tight opacity-70">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-dark-500 mb-4">Items</h3>
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div
                    key={item.menuItem}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🍽</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark-500 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-primary-500 font-bold text-sm">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(updateQuantity({ menuItemId: item.menuItem, quantity: item.quantity - 1 }))}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-dark-500">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ menuItemId: item.menuItem, quantity: item.quantity + 1 }))}
                        className="w-8 h-8 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-600 flex items-center justify-center transition-colors"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-dark-500">₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.menuItem))}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Clear all items
                </button>
                <button onClick={() => navigate('/menu')} className="text-xs text-primary-500 hover:text-primary-700 font-medium">
                  + Add more items
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-dark-500 mb-3">Special Instructions</h3>
              <textarea
                rows={3}
                value={specialInstructions}
                onChange={e => dispatch(setSpecialInstructions(e.target.value))}
                placeholder="Allergies, preferences, or special requests…"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-600 focus:outline-none focus:border-primary-400 resize-none"
              />
            </div>

            {/* Customer Info (for guests) */}
            {!isAuthenticated && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-dark-500 mb-4">Your Details</h3>
                <div className="space-y-3">
                  <input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Your name *"
                    className="input-field"
                  />
                  <input
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Phone number"
                    className="input-field"
                  />
                  <input
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="Email address"
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {orderType === 'delivery' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="font-semibold text-dark-500 mb-3">Delivery Address *</h3>
                <textarea
                  rows={3}
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address…"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-600 focus:outline-none focus:border-primary-400 resize-none"
                />
              </motion.div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-semibold text-dark-500 mb-5">Order Summary</h3>

              {/* Price breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (5%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                {deliveryCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Charge</span>
                    <span className="font-medium">₹{deliveryCharge}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary-500 text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-dark-500 mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setPaymentMethod(value)}
                      className={`py-2 px-3 text-sm rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-1 ${
                        paymentMethod === value
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <FiCreditCard className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="w-5 h-5" />
                {placing ? 'Placing Order…' : `Place Order · ₹${grandTotal.toFixed(0)}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                By placing your order you agree to our terms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
