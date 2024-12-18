"use client";
import Link from "next/link";
import { AiOutlineRight, AiOutlineLeft, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useState, useEffect } from "react"; // Thêm useEffect
import { useJobContext } from "@/app/context/JobContext";
import {
  FilterJobListResType,
  Job
} from "@/app/schemaValidations/job.schema";
import { Tech, TechListResType } from "@/app/schemaValidations/tech.schema";
import Banner from "./Banner";
import techApiRequest from "@/app/apiRequest/tech";
import { z } from "zod";
import { getCookie } from "cookies-next";
import ApiRequestSave from "@/app/apiRequest/save";
import { useApplyContext } from "@/app/context/ApplyContext";
import applyApiRequest from "@/app/apiRequest/apply";
import ApplyJobForm from "@/app/jobs/_components/ApplyJobForm";


// hàm dùng để lọc các ký tự
const candidateId = Number(getCookie("userId"));; // Thay "candidateId" bằng tên cookie chứa ID ứng viên

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/\s+/g, '') // Loại bỏ khoảng trắng (tùy chọn)
    .replace(/-/g, '');  // Loại bỏ dấu gạch ngang
}

export const getCompanyColor = (companyName: string) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-red-500 to-red-600',
    'from-yellow-500 to-yellow-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600'
  ];
  // Sử dụng tên công ty làm seed để tạo màu nhất quán
  const index = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export default function HomePage() {
  // Thay đổi 1: Sử dụng jobListContext thay vì jobListContext
  const { jobListContext } = useJobContext();
  const [jobTypes, setJobType] = useState<string[]>([]);
  const [jobRanks, setJobRank] = useState<string[]>([]);
  const [jobTechs, setJobTechs] = useState<{ [key: number]: string[] }>({});
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState<FilterJobListResType>({
    title: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "",
    jobRank: "",
    companyName: ""
  });
  const { checkApplicationStatus } = useApplyContext();
  // Thêm state mới
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  // Thay đổi 3: Thêm useEffect để cập nhật filteredJobs khi context thay đổi
  useEffect(() => {
    if (jobListContext) {

      setFilteredJobs(jobListContext);

      const uniqueJobTypes = Array.from(
        new Set(jobListContext.map(job => job.jobType))
      ).filter(Boolean).sort();

      const uniqueJobRanks = Array.from(
        new Set(jobListContext.map(job => job.jobRank))
      ).filter(Boolean).sort();

      setJobType(uniqueJobTypes);
      setJobRank(uniqueJobRanks);

    }
  }, [jobListContext]);


  useEffect(() => {
    const fetchSavedJobs = async () => {
      const username = getCookie("username");
      const sessionToken = getCookie("sessionToken");
      const candidateId = Number(getCookie("userId"));

      if (!username || !candidateId || !sessionToken) return;

      try {
        const response = await ApiRequestSave.getListSaveJobforCandidate(candidateId, sessionToken);
        if (response.status === 200 && response.payload?.data) {
          const savedJobIds = response.payload.data.map((job: { jobId: number }) => job.jobId);
          setSavedJobs(savedJobIds);
          console.log("Saved jobs:", savedJobIds); // Kiểm tra savedJobs
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách công việc đã lưu:", error);
      }
    };

    fetchSavedJobs();
  }, [candidateId]);

// DÙNG CHO BUTTON NẾU ĐÃ APPLY RỒI THÌ HIỂN THỊ NÚT ỨNG TUYỂN THÀNH ĐÃ ỨNG TUYỂN 
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      const jobIds = jobListContext
        ? jobListContext.map((job) => job.jobId)
        : [];
      console.log("Danh sách Job IDs:", jobIds);
  
      const userId = Number(getCookie("userId"));
  
      try {
        const appliedResults = await Promise.all(
          jobIds.map(async (jobId) => {
            const result = await applyApiRequest.checkApplicationStatus(userId, jobId);
            console.log(`Kết quả cho Job ID ${jobId}:`, result);
            return { jobId, isApplied: result.payload === true }; // Kết hợp jobId và payload
          })
        );
  
        // Lọc ra các jobId đã ứng tuyển
        const applied = appliedResults
          .filter((res) => res.isApplied) // Lọc job đã ứng tuyển
          .map((res) => res.jobId); // Lấy jobId
  
        console.log("Danh sách công việc đã ứng tuyển:", applied);
        setAppliedJobs(applied); // Set state với danh sách jobId
      } catch (error) {
        console.error("Lỗi khi kiểm tra danh sách công việc đã ứng tuyển:", error);
      }
    };
  
    if (jobListContext) fetchAppliedJobs();
  }, [jobListContext]);
  
  useEffect(() => {
    const fetchJobTechs = async (jobId: number) => {
      try {
        console.log('Fetching techs for job:', jobId);
        const response = await techApiRequest.getTechByJobId(jobId);
        console.log('Tech response:', response);
        if (response.payload.data) {
          const techNames = Array.isArray(response.payload.data)
            ? response.payload.data.map((tech: z.infer<typeof Tech>) => tech.name)
            : [(response.payload.data as z.infer<typeof Tech>).name];
          console.log('Tech names:', techNames);
          setJobTechs(prev => ({
            ...prev,
            [jobId]: techNames
          }));
        }
      } catch (error) {
        console.error('Error fetching tech data:', error);
      }
    };

    // Lấy danh sách công nghệ cho từng công việc
    filteredJobs.forEach(job => {
      if (job.jobId && !jobTechs[job.jobId]) {
        fetchJobTechs(job.jobId);
      }
    });
  }, [filteredJobs]);

  // Thay đổi 4: Cập nhật điều kiện loading
  if (!jobListContext) {
    return <div className="text-center text-red-500">Đang tải dữ liệu...</div>;
  }

  const jobsPerPage = 15;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const currentJobs = filteredJobs.slice(
    currentPage * jobsPerPage,
    (currentPage + 1) * jobsPerPage
  );

  // Thay đổi 5: Thêm xử lý filter thực tế
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));

    // Thay đổi 6: Thêm logic lọc trực tiếp
    const newFilters = {
      ...filters,
      [name]: value,
    };

    // Nếu tất cả các job filter đều trống, hiển thị tất cả các jobs
    const hasAtiveFilter = Object.values(newFilters).some(filters => filters !== "");

    if (!hasAtiveFilter) {
      setFilteredJobs(jobListContext);
      return;
    }

    const filtered = jobListContext.filter((job) => {
      return (
        (!newFilters.title ||
          normalizeString(job.title).includes(normalizeString(newFilters.title))) &&
        (!newFilters.location ||
          normalizeString(job.jobLocation).includes(normalizeString(newFilters.location))) &&
        (!newFilters.salaryMin || job.salary >= parseInt(newFilters.salaryMin)) &&
        (!newFilters.salaryMax || job.salary <= parseInt(newFilters.salaryMax)) &&
        (!newFilters.jobType || job.jobType === newFilters.jobType) &&
        (!newFilters.jobRank || job.jobRank === newFilters.jobRank) &&
        (!newFilters.companyName ||
          normalizeString(job.companyName).includes(normalizeString(newFilters.companyName)))
      );
    });

    setFilteredJobs(filtered);
    setCurrentPage(0);
  };

  // Hàm dùng để reset jobs
  const handleResetFilters = () => {
    setFilters({
      title: "",
      location: "",
      salaryMin: "",
      salaryMax: "",
      jobType: "",
      jobRank: "",
      companyName: ""
    });
    setFilteredJobs(jobListContext);
    setCurrentPage(0);
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };


  const toggleSaveJob = async (jobId: number) => {
    if (isSaving) return; // Ngăn spam click
    setIsSaving(true);

    try {
      if (savedJobs.includes(jobId)) {
        // Xóa công việc đã lưu
        const updatedSavedJobs = savedJobs.filter((id) => id !== jobId);
        setSavedJobs(updatedSavedJobs);

        await ApiRequestSave.DeleteJob(candidateId, jobId);
        console.log("Đã xóa công việc:", jobId);
      } else {
        // Lưu công việc
        const updatedSavedJobs = [...savedJobs, jobId];
        setSavedJobs(updatedSavedJobs);

        await ApiRequestSave.CreateSave({
          candidateId,
          jobId,
          Date: new Date().toISOString(),
        });
        console.log("Đã lưu công việc:", jobId);
      }
    } catch (error) {
      console.error("Lỗi khi lưu/xóa công việc:", error);
    } finally {
      setIsSaving(false);
    }
  };



  // Sửa lại hàm handleBannerSearch để giống với handleFilterChange
  const handleBannerSearch = async (searchTerm: string) => {
    try {
      setLoading(true);

      const searchTerms = searchTerm.split(',').map(term => term.trim());

      const filtered = jobListContext.filter(job => {
        return searchTerms.some(term => {
          const normalizedTerm = normalizeString(term);

          const matchTitle = normalizeString(job.title).includes(normalizedTerm);
          const matchLocation = normalizeString(job.jobLocation).includes(normalizedTerm);
          const matchJobType = normalizeString(job.jobType).includes(normalizedTerm);
          const matchCompany = normalizeString(job.companyName).includes(normalizedTerm); // Thêm dòng này

          return matchTitle || matchLocation || matchJobType || matchCompany;
        });
      });

      const newFilters = { ...filters };

      searchTerms.forEach(term => {
        const normalizedTerm = normalizeString(term);

        const matchingJobs = jobListContext.filter(job => {
          const matchTitle = normalizeString(job.title).includes(normalizedTerm);
          const matchLocation = normalizeString(job.jobLocation).includes(normalizedTerm);
          const matchJobType = normalizeString(job.jobType).includes(normalizedTerm);
          const matchCompany = normalizeString(job.companyName).includes(normalizedTerm); // Thêm dòng này

          if (matchJobType) newFilters.jobType = job.jobType;
          else if (matchLocation) newFilters.location = job.jobLocation;
          else if (matchCompany) newFilters.companyName = job.companyName; // Thêm dòng này
          else if (matchTitle) newFilters.title = term;

          return matchTitle || matchLocation || matchJobType || matchCompany;
        });

        if (matchingJobs.length === 0) {
          newFilters.title = term;
        }
      });

      setFilters(newFilters);
      setFilteredJobs(filtered);
      document.getElementById('jobList')?.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('Lỗi search jobs:', error);
    } finally {
      setLoading(false);
      setCurrentPage(0);
    }
  };

  // Thêm handlers mới
  // const handleSaveJob = (e: React.MouseEvent, jobId: string) => {
  //   e.preventDefault();
  //   setSavedJobs(prev => 
  //     prev.includes(jobId) 
  //       ? prev.filter(id => id !== jobId)
  //       : [...prev, jobId]
  //   );
  // };

  const handleApply = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    // Thêm logic xử lý ứng tuyển ở đây
    console.log('Ứng tuyển công việc:', jobId);
  };

  return (
    <>
      <Banner onSearch={handleBannerSearch} />
      <div id="jobList" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12 pt-20 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          {/* Search Results */}
          {filters.title && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              <span className="font-medium">Kết quả tìm kiếm cho {filters?.title}:</span> {filteredJobs?.length} công việc
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Bộ lọc tìm kiếm
                  </h3>
                  <button
                    onClick={handleResetFilters}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  >
                    Đặt lại
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Filter Inputs */}
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="title"
                      value={filters.title}
                      onChange={handleFilterChange}
                      placeholder="Tiêu đề công việc"
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <input
                      type="text"
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      placeholder="Địa điểm"
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        name="salaryMin"
                        value={filters.salaryMin}
                        onChange={handleFilterChange}
                        placeholder="Lương tối thiểu"
                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                      />
                      <input
                        type="number"
                        name="salaryMax"
                        value={filters.salaryMax}
                        onChange={handleFilterChange}
                        placeholder="Lương tối đa"
                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                      />
                    </div>

                    <select
                      name="jobType"
                      value={filters.jobType}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="">Loại hình công việc</option>
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <select
                      name="jobRank"
                      value={filters.jobRank}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="">Cấp bậc</option>
                      {jobRanks.map((rank) => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>

                    {/* Thêm input này vào phần Filter Inputs */}
                    <input
                      type="text"
                      name="companyName"
                      value={filters.companyName}
                      onChange={handleFilterChange}
                      placeholder="Tên công ty"
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job List */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : currentJobs.length === 0 ? (
                <div className="rounded-lg bg-white p-8 text-center text-gray-500 dark:bg-gray-800">
                  Không tìm thấy công việc phù hợp
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentJobs.map((job) => (
                    <Link key={job.jobId} href={`/jobs/${job.jobId}`}>

                      <div className="group relative h-full rounded-xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800">

                        <div className="flex flex-col gap-4">
                          {/* Company Info Section */}
                          <div className="flex items-center gap-4">
                            <div className={`h-16 w-16 overflow-hidden rounded-xl bg-gradient-to-br ${getCompanyColor(job.companyName)} flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform hover:scale-105`}>
                              {job.companyName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">

                                {job.companyName}
                              </h4>
                              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.jobLocation}
                              </div>
                              <button
                                onClick={() => console.log(`Ứng tuyển công việc: ${job.jobId}`)}
                                disabled={appliedJobs.includes(job.jobId)} // Nếu đã apply thì disable
                                className={`mt-2 w-full px-4 py-2 rounded ${appliedJobs.includes(job.jobId)
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                  }`}
                              >
                                {appliedJobs.includes(job.jobId) ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
                              </button>


                            </div>

                            {/* Save/Unsave Icon */}
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                toggleSaveJob(job.jobId);
                              }}
                              className="cursor-pointer text-xl"
                            >
                              {savedJobs.includes(job.jobId) ? (
                                <AiFillHeart className="text-red-600" />
                              ) : (
                                <AiOutlineHeart className="text-gray-400" />
                              )}
                            </div>


                          </div>

                          {/* Job Title & Type */}
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white">
                                {job.title}
                              </h3>
                              <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                                {job.jobType}
                              </span>
                            </div>
                          </div>

                          {/* Key Information */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {/* Salary Range */}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{job.salary ? `${job.salary.toLocaleString()} VNĐ` : "Thương lượng"}</span>
                            </div>

                            {/* Experience Level */}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{job.jobRank}</span>
                            </div>

                            {/* Posted Date */}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                {job.postingDate ? new Date(job.postingDate).toLocaleDateString('vi-VN') : 'Mới đăng'}
                              </span>
                            </div>

                            {/* Application Deadline */}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>
                                {job.expirationDate ? (
                                  `Còn ${Math.ceil((new Date(job.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày`
                                ) : 'Chưa có hạn'}
                              </span>
                            </div>
                          </div>

                          {/* Skills/Requirements Preview */}
                          <div className="flex flex-wrap gap-2">
                            {jobTechs[job.jobId] && jobTechs[job.jobId].length > 0 && (
                              <>
                                {jobTechs[job.jobId].slice(0, 3).map((techName, index) => (
                                  <span
                                    key={index}
                                    className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                  >
                                    {techName}
                                  </span>
                                ))}
                                {jobTechs[job.jobId].length > 3 && (
                                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    +{jobTechs[job.jobId].length - 3} khác
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  <AiOutlineLeft className="mr-2" size={16} />
                  Trang trước
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  Trang sau
                  <AiOutlineRight className="ml-2" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
         {/* Modal Apply Job Form */}
         {/* {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <ApplyJobForm
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              cvList={cvList} // Truyền cvList vào đây
              candidateId={candidateId}
              job={job}
            />
          </div>
        )} */}
      </div>
    </>
  );
}
