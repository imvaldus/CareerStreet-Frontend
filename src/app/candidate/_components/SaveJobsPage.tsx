"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { JobType } from "@/app/schemaValidations/save.schema";
import ApiRequestSave from '@/app/apiRequest/save';
import { number } from 'zod';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

interface SaveJobsPageProps {
  savedJobs: JobType[] | null;
  candidateId?: number | null;// Thêm prop này
}


const SaveJobsPage: React.FC<SaveJobsPageProps> = ({ savedJobs, candidateId }) => {

  console.log('Props received:', { savedJobs, candidateId });
  // CÁC BIẾN QUẢN LÝ PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  // BIẾN ĐỂ XÓA
  const [Delete, setDelete] = useState<number | null>(null);

  const router = useRouter();



  if (!savedJobs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center text-gray-500">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  const currentJobs = savedJobs.slice(indexOfFirstJob, indexOfLastJob);
  // TỔNG SỐ TRANG
  const totalPages = Math.ceil(savedJobs.length / jobsPerPage);


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // HÀM DÙNG ĐỂ XÓA
  const DeleteSaveJob = async (jobId: number) => {
    try {
      console.log('jobID', jobId, candidateId);
      setDelete(jobId);

      const response = await ApiRequestSave.DeleteJob(candidateId!, jobId);
      console.log('response khi xóa', response)
      if (response.status === 200) {
        alert('Xóa công việc đã lưu thành công');
        // Thay vì reload toàn bộ trang, cập nhật state
        const newSavedJobs = savedJobs?.filter(job => job.jobId !== jobId) ?? [];
        window.location.reload(); // Có thể bỏ dòng này nếu dùng cách cập nhật state
      } else {
        throw new Error('Xóa thất bại');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Xóa công việc thất bại');
    } finally {
      setDelete(null); // Reset trạng thái loading
    }
  }
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 p-6 sm:p-12">
      <div className="flex items-center mb-6 ml-4 sm:ml-14">
        <span className="text-sm font-medium text-gray-700">
          Công việc đã lưu ({savedJobs.length})
        </span>
      </div>

      <div className="flex justify-center">
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-screen-xl">
          {/* Main Content */}
          <div className="bg-white shadow-lg rounded-xl w-full lg:w-3/4 flex flex-col gap-4 p-6">
            {currentJobs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {currentJobs.map((job) => (
                    <div key={job.jobId} className="group relative overflow-hidden rounded-lg border border-gray-200 p-5 transition-all hover:shadow-md hover:border-blue-500">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                              <img
                                src="https://cdn.tailgrids.com/1.0/assets/images/team/image-07/image-01.png"
                                alt="company"
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/jobs/${job.jobId}`} className="block group-hover:text-blue-600">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {job.title}
                                </h3>
                              </Link>
                              <p className="mt-1 text-sm text-gray-500 truncate">
                                {job.levelName}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                  {job.jobType}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                  <svg
                                    className="mr-1.5 h-3 w-3 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {job.jobLocation}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => DeleteSaveJob(job.jobId)}
                            disabled={Delete === job.jobId}
                            className={`inline-flex items-center justify-center rounded-lg 
          ${Delete === job.jobId ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} 
          px-4 py-2 text-sm font-medium text-white transition-colors`}
                          >
                            {Delete === job.jobId ? (
                              <>
                                <span className="animate-spin mr-2">⏳</span>
                                Đang xóa...
                              </>
                            ) : (
                              <>
                                Xóa
                                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-5 5m0 0l-5-5m5 5H6" />
                                </svg>
                              </>
                            )}
                          </button>
                          <Link
                            href={`/jobs/${job.jobId}`}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Ứng tuyển
                            <svg
                              className="ml-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {/* Thay thế phần pagination cũ bằng đoạn code này */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 transition-colors hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <AiOutlineLeft className="mr-2" size={16} />
                    Trang trước
                  </button>

                  <div className="flex items-center gap-2">
                    {getPageNumbers().map((number) => (
                      <button
                        key={number}
                        onClick={() => goToPage(number)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
          ${number === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 transition-colors hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Trang sau
                    <AiOutlineRight className="ml-2" size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <svg
                  className="h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-lg font-medium">Chưa có công việc nào được lưu</p>
                <p className="mt-1 text-sm text-gray-400">
                  Hãy lưu các công việc bạn quan tâm để xem lại sau
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-white shadow-lg rounded-xl w-full lg:w-1/4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Đề xuất công việc
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Frontend Developer",
                  location: "Remote, US",
                  type: "Part-time"
                },
                {
                  title: "UI/UX Designer",
                  location: "On-site, Canada",
                  type: "Full-time"
                },
                {
                  title: "DevOps Engineer",
                  location: "Remote, UK",
                  type: "Full-time"
                }
              ].map((job, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                >
                  <Link href={`/jobs/${job.title.toLowerCase().replace(/ /g, '-')}`}>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{job.location}</p>
                    <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {job.type}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveJobsPage;