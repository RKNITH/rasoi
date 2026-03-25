import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api.js';
import { PageHeader, Table, Modal, Button, Textarea, Badge, Avatar, Pagination, EmptyState } from '../../components/common/index.jsx';
import { formatDate, timeAgo } from '../../utils/helpers.js';
import { FiStar, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const r = await api.get('/reviews', { params: { page, limit: 15 } });
      setReviews(r.data.data); setPagination(r.data.pagination);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleReply = async () => {
    setSubmitting(true);
    try {
      await api.post(`/reviews/${replyModal._id}/reply`, { message: replyText });
      toast.success('Reply added!');
      setReplyModal(null); setReplyText('');
      load();
    } catch { toast.error('Failed'); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      load();
    } catch { toast.error('Failed'); }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: pagination.total || 0, icon: '💬' },
          { label: 'Average Rating', value: `${avgRating} ⭐`, icon: '⭐' },
          { label: 'This Page', value: reviews.length, icon: '📄' },
        ].map((s, i) => (
          <div key={i} className="card p-5 text-center">
            <span className="text-3xl">{s.icon}</span>
            <p className="font-heading font-bold text-2xl text-dark-500 mt-2">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <EmptyState icon="⭐" title="No reviews yet" description="Customer reviews will appear here." />
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((review, i) => (
              <motion.div key={review._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar src={review.customer?.avatar} name={review.customer?.name} size="sm" />
                    <div>
                      <p className="font-semibold text-dark-500 text-sm">{review.customer?.name || 'Anonymous'}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, j) => (
                          <FiStar key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyModal(review); setReplyText(review.reply?.message || ''); }}>
                      <FiMessageSquare className="w-3.5 h-3.5" /> Reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(review._id)} className="text-red-500 hover:bg-red-50">Delete</Button>
                  </div>
                </div>
                {review.title && <p className="font-semibold text-dark-500 mt-3 text-sm">{review.title}</p>}
                {review.comment && <p className="text-gray-600 text-sm mt-1 leading-relaxed">{review.comment}</p>}
                {review.menuItem && <p className="text-xs text-primary-500 mt-2">📦 {review.menuItem?.name}</p>}
                {review.reply && (
                  <div className="mt-3 pl-4 border-l-2 border-primary-200 bg-primary-50 rounded-r-xl p-3">
                    <p className="text-xs text-primary-600 font-semibold mb-1">Restaurant Reply:</p>
                    <p className="text-sm text-gray-700">{review.reply.message}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        <Pagination page={page} pages={pagination.pages || 1} onPageChange={setPage} />
      </div>

      <Modal isOpen={!!replyModal} onClose={() => setReplyModal(null)} title="Reply to Review" size="md">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 italic">"{replyModal?.comment}"</p>
          <Textarea label="Your Reply" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a helpful response..." rows={4} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setReplyModal(null)}>Cancel</Button>
            <Button onClick={handleReply} loading={submitting}>Post Reply</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
