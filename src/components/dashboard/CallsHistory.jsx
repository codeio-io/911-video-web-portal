import { useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import { Heading } from '../ui/heading';
import { Text } from '../ui/text';
import { listCallsHistoryVideo } from '../../api/CustomerApi';

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}

export default function CallsHistory() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadCallHistory = useCallback(async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listCallsHistoryVideo({
        page,
        pageSize,
      });

      // Support common API response shapes: { data, total }, { items, meta }, or array
      const items = response?.data ?? response?.items ?? response;
      const total = response?.meta?.total ?? response?.total ?? (Array.isArray(items) ? items.length : 0);
      const data = Array.isArray(items) ? items : [];

      setCalls(data);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: typeof total === 'number' ? total : data.length,
      }));
    } catch (err) {
      setError('Failed to load call history. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCallHistory(pagination.current, pagination.pageSize);
  }, [loadCallHistory]);

  const handleTableChange = (newPagination) => {
    loadCallHistory(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'engagement_start_ts',
      key: 'date',
      width: 180,
      render: (text) => formatDate(text),
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      width: 120,
    },
    {
      title: 'Type',
      dataIndex: 'channel',
      key: 'type',
      width: 100,
      render: (channel) => channel || '-',
    },
    {
      title: 'Duration',
      dataIndex: 'interpretation_duration_s',
      key: 'duration',
      width: 100,
      render: (seconds) => (seconds != null ? `${Number(seconds).toFixed(1)}s` : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => status || 'completed',
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Text className="text-red-600">{error}</Text>
        <button
          onClick={() => loadCallHistory(pagination.current, pagination.pageSize)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:scale-95 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading>Call History</Heading>
        <Text className="text-zinc-500 mt-2">
          View your past video and audio calls
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={calls}
        rowKey={(record) => record.engagement_id ?? record.id ?? record.key ?? Math.random()}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} records`,
          pageSizeOptions: ['10', '20', '30', '50'],
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
