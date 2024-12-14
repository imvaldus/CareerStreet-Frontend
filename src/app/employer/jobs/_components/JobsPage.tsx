"use client";
import { JobListResType } from "@/app/schemaValidations/job.schema";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaBriefcase, 
  FaEye, 
  FaUserClock,
  FaCalendarAlt,
  FaEdit,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFilter,
  FaUser,
  FaUsers,
  FaAddressCard,
  FaEnvelope,
  FaRegClock,
  FaInfoCircle,
  FaTimes,
  FaHome,
  FaMoneyBillWave,
  FaPhone,
  FaClipboardList,
  FaClipboardCheck,
  FaExclamationCircle,
  FaGraduationCap,
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaPlus,
  FaBuilding
} from "react-icons/fa";
import { MdLocationOn, MdCardGiftcard, MdWork } from "react-icons/md";
import { MessageUtils } from "@/utils/messageUtils";

export default function JobsPage({
  jobList,
  numberOfApplications,
}: {
  jobList: JobListResType["data"] | null;
  numberOfApplications?: { [key: number]: number };
}) {
  const [selectedStatus, setSelectedStatus] = useState(3);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredJobs, setFilteredJobs] = useState<JobListResType["data"] | null>(jobList);
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'applications'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  if (!jobList) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <FaBriefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có công việc</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo một công việc mới.</p>
          <div className="mt-6">
            <Link
              href="/employer/jobs/add"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaBriefcase className="mr-2 h-4 w-4" />
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let filtered = jobList;
    
    // Kiểm tra và cập nhật trạng thái hết hạn
    const now = new Date();
    filtered = filtered?.map(job => {
      const expirationDate = new Date(job.expirationDate);
      if (expirationDate < now && job.status !== 2) {
        // Nếu đã hết hạn và chưa được đánh dấu là hết hạn
        return { ...job, status: 2 }; // Cập nhật trạng thái thành hết hạn
      }
      return job;
    }) || null;
    
    // Filter by status
    if (selectedStatus !== 3) {
      filtered = filtered?.filter(job => job.status === selectedStatus) || null;
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered?.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobLocation.toLowerCase().includes(searchTerm.toLowerCase())
      ) || null;
    }
    
    // Sort jobs
    if (filtered) {
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'desc' 
            ? new Date(b.postingDate).getTime() - new Date(a.postingDate).getTime()
            : new Date(a.postingDate).getTime() - new Date(b.postingDate).getTime();
        }
        if (sortBy === 'views') {
          return sortOrder === 'desc' 
            ? (b.views || 0) - (a.views || 0)
            : (a.views || 0) - (b.views || 0);
        }
        if (sortBy === 'applications') {
          return sortOrder === 'desc'
            ? (numberOfApplications?.[b.jobId] || 0) - (numberOfApplications?.[a.jobId] || 0)
            : (numberOfApplications?.[a.jobId] || 0) - (numberOfApplications?.[b.jobId] || 0);
        }
        return 0;
      });
      filtered = sorted;
    }
    
    setFilteredJobs(filtered);
  }, [selectedStatus, searchTerm, jobList, sortBy, sortOrder, numberOfApplications]);

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
            <FaExclamationTriangle className="mr-1" />
            Hết hạn
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  };

  // Stats calculations
  const stats = {
    total: filteredJobs?.length || 0,
    active: filteredJobs?.filter(job => job.status === 1).length || 0,
    pending: filteredJobs?.filter(job => job.status === 0).length || 0,
    rejected: filteredJobs?.filter(job => job.status === -1).length || 0,
    expired: filteredJobs?.filter(job => job.status === 2).length || 0,
    totalViews: filteredJobs?.reduce((sum, job) => sum + (job.views || 0), 0) || 0,
    totalApplications: filteredJobs?.reduce((sum, job) => sum + (numberOfApplications?.[job.jobId] || 0), 0) || 0
  };

  const checkViolations = (job: any): {
    type: string;
    description: string;
    suggestion: string;
    severity: 'high' | 'medium' | 'low';
  }[] => {
    const violations: {
      type: string;
      description: string;
      suggestion: string;
      severity: 'high' | 'medium' | 'low';
    }[] = [];

    // Kiểm tra mô tả công việc
    if (!job.jobDescription || job.jobDescription.length < 100) {
      violations.push({
        type: 'Mô tả công việc',
        description: MessageUtils.getMessage("ERROR_JOB_DESCRIPTION_TOO_SHORT"),
        suggestion: MessageUtils.getMessage("SUGGESTION_JOB_DESCRIPTION_LENGTH"), 
        severity: 'high'
      });
    }

    // Kiểm tra yêu cầu công việc
    if (!job.jobRequirements || job.jobRequirements.length < 50) {
      violations.push({
        type: 'Yêu cầu công việc',
        description: MessageUtils.getMessage("ERROR_JOB_REQUIREMENTS_TOO_SHORT"),
        suggestion: MessageUtils.getMessage("SUGGESTION_JOB_REQUIREMENTS_LENGTH"),
        severity: 'high'
      });
    }

    // Kiểm tra quyền lợi
    if (!job.benefits || job.benefits.length < 50) {
      violations.push({
        type: 'Quyền lợi',
        description: MessageUtils.getMessage("ERROR_BENEFITS_TOO_SHORT"),
        suggestion: MessageUtils.getMessage("SUGGESTION_BENEFITS_LENGTH"),
        severity: 'medium'
      });
    }

    if (job.numberOfRecruitment > 100) {
      violations.push({
        type: 'Số lượng tuyển dụng',
        description: MessageUtils.getMessage("ERROR_RECRUITMENT_NUMBER_TOO_HIGH"),
        suggestion: MessageUtils.getMessage("SUGGESTION_RECRUITMENT_NUMBER"),
        severity: 'low'
      });
    }

    // Kiểm tra địa điểm
    if (!job.jobLocation || job.jobLocation.length < 5) {
      violations.push({
        type: 'Địa điểm làm việc',
        description: MessageUtils.getMessage("ERROR_JOB_LOCATION_INVALID"),
        suggestion: MessageUtils.getMessage("SUGGESTION_JOB_LOCATION"),
        severity: 'medium'
      });
    }

    return violations;
  };

  const handleViewDetail = (job: any) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobs?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((filteredJobs?.length || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tuyển dụng</h1>
            <Link
              href="/employer/jobs/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaBriefcase className="mr-2 -ml-1 h-5 w-5" />
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Tổng tin tuyển dụng */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaBriefcase className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng tin tuyển dụng</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Tin đang hoạt động */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tin đang hoạt động</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.active}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Tin chờ duyệt */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaClock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tin chờ duyệt</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Tổng đơn ứng tuyển */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUserClock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng đơn ứng tuyển</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Tìm kiếm theo tiêu đề, loại công việc, địa điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(Number(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={3}>Tất cả trạng thái ({stats.total})</option>
                  <option value={0}>Chưa duyệt ({stats.pending})</option>
                  <option value={1}>Đã duyệt ({stats.active})</option>
                  <option value={-1}>Không duyệt ({stats.rejected})</option>
                  <option value={2}>Đã hết hạn ({stats.expired})</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'views' | 'applications')}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="date">Sắp xếp theo ngày</option>
                  <option value="views">Sắp xếp theo lượt xem</option>
                  <option value="applications">Sắp xếp theo số đơn</option>
                </select>

                <button
                  onClick={() => setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaFilter className={`h-4 w-4 transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table header */}
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin công việc
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt ứng tuyển
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems?.map((job) => (
                  <tr key={job.jobId} className={`hover:bg-gray-50 ${job.status === 2 ? 'bg-red-50' : isExpiringSoon(job.expirationDate) ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/employer/jobs/${job.jobId}/applies`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-900 mb-1"
                        >
                          {job.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <span>{job.jobType}</span>
                            <span>•</span>
                            <span>{job.jobLocation}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1 text-sm">
                        <div className="flex items-center text-gray-500">
                          <FaCalendarAlt className="h-4 w-4 mr-2" />
                          {formatDate(job.postingDate)}
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="h-4 w-4 mr-2" />
                          <span className={isExpiringSoon(job.expirationDate) ? 'text-yellow-600 font-medium' : 'text-gray-500'}>
                            {formatDate(job.expirationDate)}
                            {isExpiringSoon(job.expirationDate) && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <FaExclamationTriangle className="mr-1" />
                                Sắp hết hạn
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUsers className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {numberOfApplications?.[job.jobId] || 0}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">ứng viên</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-4">
                        {(numberOfApplications?.[job.jobId] ?? 0) > 0 ? (
                          <span className="text-gray-400 cursor-not-allowed" title="Không thể sửa vì đã có đơn ứng tuyển">
                            <FaEdit className="h-5 w-5" />
                          </span>
                        ) : (
                          <Link
                            href={`/employer/jobs/${job.jobId}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <FaEdit className="h-5 w-5" />
                          </Link>
                        )}
                        <Link
                          href={`/employer/jobs/${job.jobId}/applies`}
                          className="text-green-600 hover:text-green-900"
                          title="Xem đơn ứng tuyển"
                        >
                          <FaUserClock className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleViewDetail(job)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết và kiểm tra vi phạm"
                        >
                          <FaInfoCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">{indexOfFirstItem + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredJobs?.length || 0)}
                  </span>
                  {' '}trong{' '}
                  <span className="font-medium">{filteredJobs?.length || 0}</span>
                  {' '}kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Trang đầu</span>
                    <FaAngleDoubleLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Trước</span>
                    <FaAngleLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === currentPage;
                    const isWithinRange = 
                      pageNumber === 1 || 
                      pageNumber === totalPages || 
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                    if (!isWithinRange) {
                      if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Sau</span>
                    <FaAngleRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Trang cuối</span>
                    <FaAngleDoubleRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Chi tiết */}
      {isDetailModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b z-10">
              <div className="flex justify-between items-center p-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết tin tuyển dụng</h2>
                  {getStatusBadge(selectedJob.status)}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-gray-500">
                      <FaEye className="w-5 h-5 mr-2 text-blue-500" />
                      <span className="font-medium">{selectedJob.views || 0}</span>
                      <span className="ml-1 text-sm">lượt xem</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FaUserClock className="w-5 h-5 mr-2 text-green-500" />
                      <span className="font-medium">{numberOfApplications?.[selectedJob.jobId] || 0}</span>
                      <span className="ml-1 text-sm">đơn ứng tuyển</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-3 h-[calc(90vh-88px)]">
              {/* Main Content - 2 columns */}
              <div className="col-span-2 border-r bg-gray-50 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Job Header Card */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h1>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FaBuilding className="w-5 h-5 mr-2 text-gray-400" />
                          <span className="font-medium">{selectedJob.companyName}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MdLocationOn className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.jobLocation}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaMoneyBillWave className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.salary?.toLocaleString()} VND</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FaBriefcase className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.jobType}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaUsers className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.numberOfRecruitment} người</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaCalendarAlt className="w-5 h-5 mr-2 text-gray-400" />
                          <span>Hết hạn: {formatDate(selectedJob.expirationDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-2">
                    {/* Job Description */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                        <MdWork className="mr-2 text-blue-500" />
                        Mô tả công việc
                      </h3>
                      <div className="prose max-w-none text-gray-600">
                        {selectedJob.jobDescription?.split('\n').map((paragraph: string, idx: number) => (
                          <p key={idx} className="mb-2">{paragraph}</p>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                        <FaClipboardList className="mr-2 text-green-500" />
                        Yêu cầu ứng viên
                      </h3>
                      <div className="prose max-w-none text-gray-600">
                        {selectedJob.jobRequirements?.split('\n').map((req: string, idx: number) => (
                          <p key={idx} className="mb-2">{req}</p>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                        <MdCardGiftcard className="mr-2 text-purple-500" />
                        Quyền lợi
                      </h3>
                      <div className="prose max-w-none text-gray-600">
                        {selectedJob.benefits?.split('\n').map((benefit: string, idx: number) => (
                          <p key={idx} className="mb-2">{benefit}</p>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                        <FaAddressCard className="mr-2 text-blue-500" />
                        Thông tin liên hệ
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600">
                            <FaUser className="w-5 h-5 mr-3 text-gray-400" />
                            <span>{selectedJob.contactPerson}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaEnvelope className="w-5 h-5 mr-3 text-gray-400" />
                            <span className="truncate">{selectedJob.contactEmail}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaPhone className="w-5 h-5 mr-3 text-gray-400" />
                            <span>{selectedJob.contactPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Suggestions */}
              <div className="bg-gray-50 overflow-y-auto">
                <div className="p-6">
                  <div className="sticky top-6 space-y-6">                 
                    {/* Suggestions */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gợi ý cải thiện</h3>
                      {checkViolations(selectedJob).length > 0 ? (
                        <div className="space-y-4">
                          {checkViolations(selectedJob).map((violation, index) => (
                            <div 
                              key={index} 
                              className={`p-4 rounded-lg ${
                                violation.severity === 'high'
                                  ? 'bg-red-50'
                                  : violation.severity === 'medium'
                                  ? 'bg-yellow-50'
                                  : 'bg-blue-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  {violation.severity === 'high' ? (
                                    <FaExclamationTriangle className="text-red-500 mr-2" />
                                  ) : violation.severity === 'medium' ? (
                                    <FaExclamationCircle className="text-yellow-500 mr-2" />
                                  ) : (
                                    <FaInfoCircle className="text-blue-500 mr-2" />
                                  )}
                                  <h4 className="font-medium">{violation.type}</h4>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{violation.description}</p>
                              <p className="text-sm text-gray-600 mb-3 italic">
                                Gợi ý: {violation.suggestion}
                              </p>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/employer/jobs/${selectedJob.jobId}/edit#${violation.type.toLowerCase().replace(/\s+/g, '-')}`}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group"
                                >
                                  <FaEdit className="mr-2 group-hover:scale-110 transition-transform" />
                                  <span>
                                    Chỉnh sửa phần{' '}
                                    <span className="font-medium underline">
                                      {violation.type.toLowerCase()}
                                    </span>
                                  </span>
                                  <FaAngleRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                {violation.severity === 'high' && (
                                  <span className="text-xs text-red-500 flex items-center">
                                    <FaExclamationTriangle className="mr-1" />
                                    Ưu tiên chỉnh sửa
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center text-green-700">
                            <FaCheckCircle className="mr-2" />
                            <span className="font-medium">Tin tuyển dụng đã đạt tiêu chuẩn</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <Link
                          href={`/employer/jobs/${selectedJob.jobId}/edit`}
                          className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FaEdit className="mr-2" />
                          Chỉnh sửa
                        </Link>
                        <Link
                          href={`/employer/jobs/${selectedJob.jobId}/applies`}
                          className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <FaUserClock className="mr-2" />
                          Đơn ứng tuyển
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
