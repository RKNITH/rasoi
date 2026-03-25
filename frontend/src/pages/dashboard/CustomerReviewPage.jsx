import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchOrders } from '../../store/slices/orderSlice.js';
import { PageHeader, EmptyState, Button, Textarea, Modal } from '../../components/common/index.jsx';
import { formatDate, formatCurrency } from '../../utils/helpers.js';
import { FiStar, FiEdit, FiCheck } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

// ── Star Rating Widget ────────────────────────────────────────────────────────
function StarRating({ value, onChange, size = 'md' }) {
    const [hovered, setHovered] = useState(0);
    const sz = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                >
                    <FiStar
                        className={`${sz} transition-colors ${star <= (hovered || value)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

const RATING_LABELS = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomerReviewPage() {
    const dispatch = useDispatch();
    const { orders, isLoading } = useSelector(s => s.orders);

    // Only completed orders are reviewable
    const completedOrders = orders.filter(o => o.status === 'completed');

    // My submitted reviews (fetched separately)
    const [myReviews, setMyReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    // Review form state
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedItem, setSelectedItem] = useState('');   // menuItem._id
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchOrders({ limit: 50 }));
        loadMyReviews();
    }, [dispatch]);

    const loadMyReviews = async () => {
        setReviewsLoading(true);
        try {
            const res = await api.get('/reviews', { params: { limit: 50 } });
            setMyReviews(res.data.data || []);
        } catch { }
        setReviewsLoading(false);
    };

    // IDs of menu items already reviewed by this customer
    const reviewedItemIds = new Set(myReviews.map(r => r.menuItem?._id || r.menuItem));

    const openReviewModal = (order) => {
        setSelectedOrder(order);
        // Pre-select first un-reviewed item
        const firstUnreviewed = order.items?.find(i => !reviewedItemIds.has(i.menuItem?._id || i.menuItem));
        setSelectedItem(firstUnreviewed?.menuItem?._id || firstUnreviewed?.menuItem || '');
        setRating(0);
        setTitle('');
        setComment('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return toast.error('Please select a star rating');
        if (!selectedItem) return toast.error('Please select an item to review');
        if (!comment.trim()) return toast.error('Please write a comment');

        setSubmitting(true);
        try {
            await api.post('/reviews', {
                menuItem: selectedItem,
                order: selectedOrder._id,
                rating,
                title: title.trim(),
                comment: comment.trim(),
            });
            toast.success('🌟 Review submitted! Thank you.');
            setShowModal(false);
            loadMyReviews(); // refresh
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    // Items in a given order that haven't been reviewed yet
    const unreviewedItems = (order) =>
        (order.items || []).filter(i => !reviewedItemIds.has(i.menuItem?._id || i.menuItem));

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Reviews"
                subtitle="Share your experience with dishes you've ordered"
            />

            {/* ── Completed orders ready to review ── */}
            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-heading font-bold text-lg text-dark-500">Orders You Can Review</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Only completed orders are eligible for reviews</p>
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : completedOrders.length === 0 ? (
                    <EmptyState
                        icon="🧾"
                        title="No completed orders yet"
                        description="Once your orders are delivered and marked complete, you can leave a review."
                    />
                ) : (
                    <div className="divide-y divide-gray-50">
                        {completedOrders.map(order => {
                            const canReview = unreviewedItems(order).length > 0;
                            return (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-6 py-4 flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-dark-500 text-sm">{order.orderNumber}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} ·{' '}
                                            {formatCurrency(order.total)} · {formatDate(order.createdAt)}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {order.items?.map((item, idx) => {
                                                const itemId = item.menuItem?._id || item.menuItem;
                                                const reviewed = reviewedItemIds.has(itemId);
                                                return (
                                                    <span
                                                        key={idx}
                                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${reviewed
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                    >
                                                        {reviewed && '✓ '}{item.name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {canReview ? (
                                            <button
                                                onClick={() => openReviewModal(order)}
                                                className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                                            >
                                                <FiEdit className="w-4 h-4" /> Write Review
                                            </button>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium bg-green-50 px-4 py-2 rounded-xl">
                                                <FiCheck className="w-4 h-4" /> All Reviewed
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── My Submitted Reviews ── */}
            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-heading font-bold text-lg text-dark-500">My Submitted Reviews</h2>
                </div>

                {reviewsLoading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : myReviews.length === 0 ? (
                    <EmptyState icon="⭐" title="No reviews yet" description="Your submitted reviews will appear here." />
                ) : (
                    <div className="divide-y divide-gray-50">
                        {myReviews.map((review, i) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-6 py-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-dark-500">
                                            {review.menuItem?.name || 'Menu Item'}
                                        </p>
                                        <div className="flex gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <FiStar
                                                    key={s}
                                                    className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                                                />
                                            ))}
                                            <span className="text-xs text-gray-400 ml-1">{RATING_LABELS[review.rating]}</span>
                                        </div>
                                        {review.title && <p className="font-semibold text-dark-500 text-sm mt-2">{review.title}</p>}
                                        {review.comment && <p className="text-gray-600 text-sm mt-1 leading-relaxed">{review.comment}</p>}

                                        {/* Restaurant reply */}
                                        {review.reply?.message && (
                                            <div className="mt-3 pl-4 border-l-2 border-primary-300 bg-primary-50 rounded-r-xl p-3">
                                                <p className="text-xs font-semibold text-primary-600 mb-1">Restaurant Reply:</p>
                                                <p className="text-sm text-gray-700">{review.reply.message}</p>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Review Submission Modal ── */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Write a Review"
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">

                        {/* Item selector */}
                        <div>
                            <label className="label">Which item are you reviewing? <span className="text-red-500">*</span></label>
                            <select
                                value={selectedItem}
                                onChange={e => setSelectedItem(e.target.value)}
                                className="input-field"
                                required
                            >
                                <option value="">Select an item…</option>
                                {selectedOrder?.items?.map((item, idx) => {
                                    const itemId = item.menuItem?._id || item.menuItem;
                                    const alreadyReviewed = reviewedItemIds.has(itemId);
                                    return (
                                        <option key={idx} value={itemId} disabled={alreadyReviewed}>
                                            {item.name}{alreadyReviewed ? ' (already reviewed)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Star rating */}
                        <div>
                            <label className="label">Your Rating <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-3">
                                <StarRating value={rating} onChange={setRating} size="lg" />
                                {rating > 0 && (
                                    <span className="text-sm font-semibold text-amber-500">{RATING_LABELS[rating]}</span>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="label">Review Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Sum up your experience in a line…"
                                className="input-field"
                                maxLength={100}
                            />
                        </div>

                        {/* Comment */}
                        <Textarea
                            label="Your Review *"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Describe the taste, presentation, portion size, or anything else…"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex gap-3 justify-end px-6 pb-6">
                        <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting…' : '🌟 Submit Review'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
