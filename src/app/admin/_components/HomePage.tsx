/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaBriefcase,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaChartPie,
} from "react-icons/fa";
import jobApiRequest from "@/app/apiRequest/job";
import { JobListResType } from "@/app/schemaValidations/job.schema";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Update ChartJS registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface Stats {
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
  rejectedJobs: number;
  expiredJobs: number;
  totalViews: number;
  totalCompanies: number;
  averageJobsPerCompany: number;
  mostActiveCompany: {
    name: string;
    jobCount: number;
  };
  jobsByLevel: {
    [key: string]: number;
  };
  monthlyStats: {
    [key: string]: {
      total: number;
      active: number;
      pending: number;
      rejected: number;
      expired: number;
    };
  };
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    rejectedJobs: 0,
    expiredJobs: 0,
    totalViews: 0,
    totalCompanies: 0,
    averageJobsPerCompany: 0,
    mostActiveCompany: {
      name: "",
      jobCount: 0,
    },
    jobsByLevel: {},
    monthlyStats: {},
  });

  // Add month selection state
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const [recentJobs, setRecentJobs] = useState<JobListResType["data"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const jobsResponse = await jobApiRequest.getAllJob();
        const jobs = Array.isArray(jobsResponse?.payload?.data)
          ? jobsResponse.payload.data
          : [];

        // Calculate monthly statistics
        const monthlyStats = jobs.reduce((acc, job) => {
          const date = new Date(job.postingDate);
          const yearMonth = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;

          if (!acc[yearMonth]) {
            acc[yearMonth] = {
              total: 0,
              active: 0,
              pending: 0,
              rejected: 0,
              expired: 0,
            };
          }

          acc[yearMonth].total++;
          switch (job.status) {
            case 1:
              acc[yearMonth].active++;
              break;
            case 0:
              acc[yearMonth].pending++;
              break;
            case -1:
              acc[yearMonth].rejected++;
              break;
            case 2:
              acc[yearMonth].expired++;
              break;
          }

          return acc;
        }, {} as Stats["monthlyStats"]);

        setStats((prev) => ({
          ...prev,
          // ... existing stats calculations ...
          monthlyStats,
        }));

        // Tính toán thống kê
        const companies = new Set(jobs.map((job) => job.companyName));
        const companyJobCounts = jobs.reduce((acc, job) => {
          acc[job.companyName] = (acc[job.companyName] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const mostActiveCompany = Object.entries(companyJobCounts).reduce<{
          name: string;
          jobCount: number;
        }>(
          (max, [name, count]) =>
            (count as number) > max.jobCount
              ? { name, jobCount: count as number }
              : max,
          { name: "", jobCount: 0 }
        );

        const jobsByLevel = jobs.reduce((acc, job) => {
          acc[job.levelName] = (acc[job.levelName] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        setStats({
          totalJobs: jobs.length,
          activeJobs: jobs.filter((job) => job.status === 1).length,
          pendingJobs: jobs.filter((job) => job.status === 0).length,
          rejectedJobs: jobs.filter((job) => job.status === -1).length,
          expiredJobs: jobs.filter((job) => job.status === 2).length,
          totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
          totalCompanies: companies.size,
          averageJobsPerCompany: companies.size
            ? jobs.length / companies.size
            : 0,
          mostActiveCompany,
          jobsByLevel,
          monthlyStats,
        });

        setRecentJobs(jobs.slice(0, 5));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cập nhật levelChartData để phụ thuộc vào selectedYear
  const levelChartData = {
    labels: Object.keys(stats.jobsByLevel),
    datasets: [
      {
        label: "Số lượng tin",
        data: Object.keys(stats.jobsByLevel).map((level) => {
          // Lọc jobs theo năm được chọn và đếm số lượng cho mỗi cấp bậc
          return recentJobs.filter((job) => {
            const jobYear = new Date(job.postingDate).getFullYear();
            return jobYear === selectedYear && job.levelName === level;
          }).length;
        }),
        backgroundColor: "#60A5FA",
      },
    ],
  };

  // Update monthlyChartData to include all statuses
  const monthlyChartData = {
    labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
    datasets: [
      {
        label: "Tổng tin",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthKey = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
          return stats.monthlyStats[monthKey]?.total || 0;
        }),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.1,
      },
      {
        label: "Đã duyệt",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthKey = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
          return stats.monthlyStats[monthKey]?.active || 0;
        }),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.1,
      },
      {
        label: "Chờ duyệt",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthKey = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
          return stats.monthlyStats[monthKey]?.pending || 0;
        }),
        borderColor: "#FBBF24",
        backgroundColor: "rgba(251, 191, 36, 0.5)",
        tension: 0.1,
      },
      {
        label: "Từ chối",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthKey = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
          return stats.monthlyStats[monthKey]?.rejected || 0;
        }),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.1,
      },
      {
        label: "Hết hạn",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthKey = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
          return stats.monthlyStats[monthKey]?.expired || 0;
        }),
        borderColor: "#6B7280",
        backgroundColor: "rgba(107, 114, 128, 0.5)",
        tension: 0.1,
      },
    ],
  };

  // Update the chart options for better visibility with more lines
  <Line
    data={monthlyChartData}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          align: "start",
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        title: {
          display: true,
          text: `Thống kê tin tuyển dụng năm ${selectedYear}`,
          padding: {
            bottom: 30,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      elements: {
        line: {
          borderWidth: 2,
        },
        point: {
          radius: 3,
          hoverRadius: 5,
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
    }}
  />;

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" />
            Chưa duyệt
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Đã duyệt
          </span>
        );
      case -1:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" />
            Không duyệt
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaCalendarAlt className="mr-1" />
            Hết hạn
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Thống kê hệ thống
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng quan chi tiết về hoạt động tuyển dụng
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Tổng tin tuyển dụng */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-blue-500 p-3">
                    <FaBriefcase className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng tin tuyển dụng
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalJobs}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="font-medium text-gray-700">Trạng thái:</div>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="flex justify-between text-gray-500">
                    <span>Hoạt động:</span>
                    <span className="font-medium text-green-600">
                      {stats.activeJobs}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Chờ duyệt:</span>
                    <span className="font-medium text-yellow-600">
                      {stats.pendingJobs}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Từ chối:</span>
                    <span className="font-medium text-red-600">
                      {stats.rejectedJobs}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Hết hạn:</span>
                    <span className="font-medium text-gray-600">
                      {stats.expiredJobs}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thống kê công ty */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-purple-500 p-3">
                    <FaBuilding className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Thống kê công ty
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalCompanies}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="font-medium text-gray-700">Chi tiết:</div>
                <div className="mt-1 space-y-2">
                  <div className="flex justify-between text-gray-500">
                    <span>Trung bình:</span>
                    <span>
                      {stats.averageJobsPerCompany.toFixed(1)} tin/công ty
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tích cực nhất:</span>
                    <span>
                      {stats.mostActiveCompany.name} (
                      {stats.mostActiveCompany.jobCount} tin)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thống kê lượt xem */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-green-500 p-3">
                    <FaEye className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Thống kê lượt xem
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalViews}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="font-medium text-gray-700">Trung bình:</div>
                <div className="mt-1 text-gray-500">
                  {(stats.totalViews / stats.totalJobs).toFixed(1)} lượt xem/tin
                </div>
              </div>
            </div>
          </div>

          {/* Thống kê theo cấp bậc */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-yellow-500 p-3">
                    <FaChartPie className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Phân bố cấp bậc
                    </dt>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="space-y-2">
                  {Object.entries(stats.jobsByLevel).map(([level, count]) => (
                    <div
                      key={level}
                      className="flex justify-between text-gray-500"
                    >
                      <span>{level}:</span>
                      <span>{count} tin</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Statistics Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg col-span-full mt-5">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="rounded-md bg-indigo-500 p-3">
                  <FaChartPie className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Thống kê theo tháng
                  </h3>
                  <p className="text-sm text-gray-500">
                    Biểu đồ tin tuyển dụng theo thời gian
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-80">
              <Line
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: `Thống kê tin tuyển dụng năm ${selectedYear}`,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Thống kê theo cấp bậc */}
        <div className="bg-white overflow-hidden shadow rounded-lg col-span-2">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="rounded-md bg-yellow-500 p-3">
                  <FaChartPie className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Phân bố cấp bậc
                  </h3>
                  <p className="text-sm text-gray-500">
                    Số lượng tin theo từng cấp bậc năm {selectedYear}
                  </p>
                </div>
              </div>
              {/* Thêm dropdown chọn năm */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-64">
              <Bar
                data={levelChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: `Phân bố cấp bậc năm ${selectedYear}`,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Tin tuyển dụng gần đây
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                5 tin tuyển dụng mới nhất trong hệ thống
              </p>
            </div>
            <Link
              href="/admin/jobs"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Xem tất cả
              <FaExternalLinkAlt className="ml-2 h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentJobs.map((job: any) => (
              <div
                key={job.jobId}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FaBriefcase className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <FaBuilding className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {job.companyName}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {job.jobLocation}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUsers className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {job.numberOfRecruitment} vị trí
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMoneyBillWave className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {job.salary?.toLocaleString()} VND
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {new Date(job.postingDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex flex-col items-end space-y-3">
                    {getStatusBadge(job.status)}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaEye className="h-4 w-4 mr-1" />
                        {job.views || 0} lượt xem
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {job.levelName}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {job.jobType}
                  </span>
                  {job.techStacks?.map((tech: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
