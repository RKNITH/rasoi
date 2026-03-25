import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api.js';
import { PageHeader, Pagination, Avatar } from '../../components/common/index.jsx';
import { timeAgo, formatDateTime } from '../../utils/helpers.js';

const levelColors = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  error: 'bg-red-100 text-red-600'
};

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const r = await api.get('/activities', { params: { page, limit: 25 } });
        setActivities(r.data.data);
        setPagination(r.data.pagination);
      } catch {}
      setIsLoading(false);
    })();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Log" />

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="font-medium">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((a, i) => (
              <motion.div key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <Avatar src={a.user?.avatar} name={a.user?.name || 'System'} size="sm" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-dark-500">{a.user?.name || 'System'}</span>
                    <span className={`badge text-xs ${levelColors[a.level] || levelColors.info}`}>{a.action}</span>
                    {a.entity && <span className="text-xs text-gray-400">on {a.entity}</span>}
                  </div>
                  {a.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{a.description}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{timeAgo(a.createdAt)}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{formatDateTime(a.createdAt)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <Pagination page={page} pages={pagination.pages || 1} onPageChange={setPage} />
      </div>
    </div>
  );
}
