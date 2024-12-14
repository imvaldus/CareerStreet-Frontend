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
  FaChartPie
} from "react-icons/fa";
import jobApiRequest from "@/app/apiRequest/job";
import { JobListResType } from "@/app/schemaValidations/job.schema";

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
      name: '',
      jobCount: 0
    },
    jobsByLevel: {}
  });
  const [recentJobs, setRecentJobs] = useState<JobListResType["data"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const jobsResponse = await jobApiRequest.getAllJob();
        const jobs = Array.isArray(jobsResponse?.payload?.data) ? jobsResponse.payload.data : [];
        
        // Tính toán thống kê
        const companies = new Set(jobs.map(job => job.companyName));
        const companyJobCounts = jobs.reduce((acc, job) => {
          acc[job.companyName] = (acc[job.companyName] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const mostActiveCompany = Object.entries(companyJobCounts)
          .reduce<{ name: string; jobCount: number }>((max, [name, count]) => 
            (count as number) > max.jobCount ? { name, jobCount: count as number } : max,
            { name: '', jobCount: 0 }
          );

        const jobsByLevel = jobs.reduce((acc, job) => {
          acc[job.levelName] = (acc[job.levelName] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        setStats({
          totalJobs: jobs.length,
          activeJobs: jobs.filter(job => job.status === 1).length,
          pendingJobs: jobs.filter(job => job.status === 0).length,
          rejectedJobs: jobs.filter(job => job.status === -1).length,
          expiredJobs: jobs.filter(job => job.status === 2).length,
          totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
          totalCompanies: companies.size,
          averageJobsPerCompany: companies.size ? jobs.length / companies.size : 0,
          mostActiveCompany,
          jobsByLevel
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
          <h1 className="text-2xl font-bold text-gray-900">Thống kê hệ thống</h1>
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
                    <span className="font-medium text-green-600">{stats.activeJobs}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Chờ duyệt:</span>
                    <span className="font-medium text-yellow-600">{stats.pendingJobs}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Từ chối:</span>
                    <span className="font-medium text-red-600">{stats.rejectedJobs}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Hết hạn:</span>
                    <span className="font-medium text-gray-600">{stats.expiredJobs}</span>
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
                    <span>{stats.averageJobsPerCompany.toFixed(1)} tin/công ty</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tích cực nhất:</span>
                    <span>{stats.mostActiveCompany.name} ({stats.mostActiveCompany.jobCount} tin)</span>
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
                    <div key={level} className="flex justify-between text-gray-500">
                      <span>{level}:</span>
                      <span>{count} tin</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Tin tuyển dụng gần đây</h2>
              <p className="text-sm text-gray-500 mt-1">5 tin tuyển dụng mới nhất trong hệ thống</p>
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
              <div key={job.jobId} className="p-6 hover:bg-gray-50 transition-colors">
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
                        {new Date(job.postingDate).toLocaleDateString('vi-VN')}
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
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
