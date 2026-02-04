import { useState, useEffect, useCallback } from "react";
import { Table } from "antd";
import { Button } from "../ui/button";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { Label } from "../ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib/utils";
import { listCallsHistoryVideo } from "../../api/CustomerApi";

const MAX_RANGE_DAYS = 31;

function formatDateRangeDisplay(from, to) {
  if (!from) return null;
  const opts = { month: "short", day: "numeric", year: "numeric" };
  const fromStr = from.toLocaleDateString("en-US", opts);
  if (!to || from.getTime() === to.getTime()) return fromStr;
  return `${fromStr} - ${to.toLocaleDateString("en-US", opts)}`;
}

function getTodayDateRange() {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const to = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  );
  return { from, to };
}

function diffDays(d1, d2) {
  const start = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const end = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`size-5 ${spinning ? "animate-spin" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.312.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31a7 7 0 00-11.713 3.138.75.75 0 001.45.389 5.5 5.5 0 019.202-2.466l.312.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const EST_TIMEZONE = "America/New_York";

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      timeZone: EST_TIMEZONE,
      dateStyle: "short",
      timeStyle: "medium",
    });
  } catch {
    return dateString;
  }
}

export default function CallsHistory() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(() => getTodayDateRange());
  const [dateRangeError, setDateRangeError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadCallHistory = useCallback(
    async (page = 1, pageSize = 10, dateFrom, dateTo) => {
      try {
        setLoading(true);
        setError(null);
        const params = { page, pageSize };
        if (dateFrom) params.startDate = dateFrom;
        if (dateTo) params.endDate = dateTo;
        const response = await listCallsHistoryVideo(params);

      // Support common API response shapes: { data, total }, { items, meta }, or array
      const items = response?.data ?? response?.items ?? response;
      const total =
        response?.meta?.total ??
        response?.total ??
        (Array.isArray(items) ? items.length : 0);
      const data = Array.isArray(items) ? items : [];

      setCalls(data);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: typeof total === "number" ? total : data.length,
      }));
    } catch (err) {
      setError("Failed to load call history. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  },
    [dateRange]
  );

  const getDateParams = useCallback(() => {
    if (!dateRange?.from) return {};
    const from = dateRange.from;
    const to = dateRange.to ?? dateRange.from;
    return {
      dateFrom: toLocalDateString(from),
      dateTo: toLocalDateString(to),
    };
  }, [dateRange]);

  useEffect(() => {
    const dateFrom = dateRange?.from
      ? toLocalDateString(dateRange.from)
      : undefined;
    const dateTo = dateRange?.to
      ? toLocalDateString(dateRange.to)
      : dateRange?.from
        ? toLocalDateString(dateRange.from)
        : undefined;
    loadCallHistory(pagination.current, pagination.pageSize, dateFrom, dateTo);
  }, [loadCallHistory]);

  const handleTableChange = (newPagination) => {
    const { dateFrom, dateTo } = getDateParams();
    loadCallHistory(
      newPagination.current,
      newPagination.pageSize,
      dateFrom,
      dateTo
    );
  };

  const handleDateSelect = (newDate) => {
    setDateRangeError(null);
    if (!newDate) {
      setDateRange(getTodayDateRange());
      return;
    }
    if (!newDate.from) {
      setDateRange(getTodayDateRange());
      return;
    }
    if (newDate.to && newDate.from) {
      const days = diffDays(newDate.from, newDate.to);
      if (days > MAX_RANGE_DAYS) {
        setDateRangeError(
          "Date range cannot exceed 31 days. Please select a smaller range."
        );
        return;
      }
    }
    const from = new Date(
      newDate.from.getFullYear(),
      newDate.from.getMonth(),
      newDate.from.getDate()
    );
    const to = newDate.to
      ? new Date(
          newDate.to.getFullYear(),
          newDate.to.getMonth(),
          newDate.to.getDate(),
          23,
          59,
          59,
          999
        )
      : new Date(
          newDate.from.getFullYear(),
          newDate.from.getMonth(),
          newDate.from.getDate(),
          23,
          59,
          59,
          999
        );
    setDateRange({ from, to });
  };

  const columns = [
    {
      title: "Call Start",
      dataIndex: "engagement_start_ts",
      key: "date",
      width: 180,
      render: (text) => formatDate(text),
    },
    {
      title: "Call End",
      dataIndex: "engagement_end_ts",
      key: "date",
      width: 180,
      render: (text) => formatDate(text),
    },
    {
      title: "Type",
      dataIndex: "channel",
      key: "type",
      width: 100,
      render: (channel) => channel || "-",
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      width: 120,
    },
    {
      title: "Interpreter ID",
      dataIndex: "interpreter_answered_s_id",
      key: "interpreter_answered_s_id",
      width: 120,
      render: (interpreter_answered_s_id) => interpreter_answered_s_id || "-",
    },
    {
      title: "Duration",
      dataIndex: "interpretation_duration_s",
      key: "duration",
      width: 100,
      render: (seconds) => {
        if (seconds == null || isNaN(seconds)) return "-";
        // Convert seconds to HH:MM:SS
        const s = Math.floor(Number(seconds));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        const pad = (v) => v.toString().padStart(2, "0");
        return `${pad(h)}:${pad(m)}:${pad(sec)}`;
      },
    },
    {
      title: "Total Billed ($)",
      dataIndex: "customer_bill",
      key: "customer_bill",
      width: 120,
      render: (customer_bill) => customer_bill || "0",
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Text className="text-red-600">{error}</Text>
        <button
          onClick={() =>
            loadCallHistory(pagination.current, pagination.pageSize)
          }
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:scale-95 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleRefresh = () => {
    const { dateFrom, dateTo } = getDateParams();
    loadCallHistory(pagination.current, pagination.pageSize, dateFrom, dateTo);
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setDateRangeError(null);
    loadCallHistory(pagination.current, pagination.pageSize, undefined, undefined);
  };

  const hasActiveFilters = !!dateRange?.from;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Heading>Call History</Heading>
          <Text className="text-zinc-500 mt-2">
            View your past video and audio calls
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 active:scale-95 transition-all duration-200 shrink-0 flex items-center gap-2"
          title="Refresh call history"
        >
          <RefreshIcon spinning={loading} />
          <span>{loading ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date" className="text-muted-foreground text-sm font-normal">
              Date Range{" "}
              <span className="text-xs text-zinc-400">(max 31 days)</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-[240px]",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {dateRange?.from ? (
                    dateRange.to && dateRange.from.getTime() !== dateRange.to?.getTime() ? (
                      formatDateRangeDisplay(dateRange.from, dateRange.to)
                    ) : (
                      formatDateRangeDisplay(dateRange.from, null)
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-border bg-white text-popover-foreground shadow-md rounded-md" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  disabled={(calendarDate) => {
                    if (
                      dateRange?.from &&
                      !dateRange?.to &&
                      calendarDate instanceof Date
                    ) {
                      const days = Math.abs(
                        diffDays(dateRange.from, calendarDate)
                      );
                      return days > MAX_RANGE_DAYS;
                    }
                    return false;
                  }}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
            {dateRangeError && (
              <Text className="text-xs text-destructive">
                {dateRangeError}
              </Text>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters || loading}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            Clear filters
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Table
          columns={columns}
          dataSource={calls}
          rowKey={(record) =>
            record.engagement_id ?? record.id ?? record.key ?? Math.random()
          }
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
            pageSizeOptions: ["10", "20", "30", "50"],
            onChange: (page, pageSize) =>
              handleTableChange({ current: page, pageSize }),
          }}
          scroll={{ x: "max-content" }}
          style={{ minWidth: "max-content" }}
        />
      </div>
    </div>
  );
}
