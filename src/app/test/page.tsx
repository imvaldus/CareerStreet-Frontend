/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

const jobData = [
  { id: 1, title: "Software Engineer", company: "Company A", location: "Hà Nội", salary: "20,000,000 VND", datePosted: "2024-10-01", experience: "2-3 năm" },
  { id: 2, title: "Product Manager", company: "Company B", location: "TP. HCM", salary: "25,000,000 VND", datePosted: "2024-10-02", experience: "3-5 năm" },
  { id: 3, title: "UX/UI Designer", company: "Company C", location: "Đà Nẵng", salary: "18,000,000 VND", datePosted: "2024-10-03", experience: "1-2 năm" },
  { id: 4, title: "Data Analyst", company: "Company D", location: "Hà Nội", salary: "22,000,000 VND", datePosted: "2024-10-04", experience: "2-3 năm" },
  { id: 5, title: "System Administrator", company: "Company E", location: "TP. HCM", salary: "15,000,000 VND", datePosted: "2024-10-05", experience: "1-2 năm" },
  { id: 6, title: "Frontend Developer", company: "Company F", location: "Hà Nội", salary: "21,000,000 VND", datePosted: "2024-10-06", experience: "2-4 năm" },
  { id: 7, title: "Backend Developer", company: "Company G", location: "Đà Nẵng", salary: "23,000,000 VND", datePosted: "2024-10-07", experience: "3-5 năm" },
  { id: 8, title: "DevOps Engineer", company: "Company H", location: "TP. HCM", salary: "28,000,000 VND", datePosted: "2024-10-08", experience: "3-5 năm" },
  { id: 9, title: "Mobile Developer", company: "Company I", location: "Hà Nội", salary: "24,000,000 VND", datePosted: "2024-10-09", experience: "2-4 năm" },
  { id: 10, title: "Technical Writer", company: "Company J", location: "Đà Nẵng", salary: "17,000,000 VND", datePosted: "2024-10-10", experience: "1-3 năm" },
  { id: 11, title: "Sales Engineer", company: "Company K", location: "TP. HCM", salary: "26,000,000 VND", datePosted: "2024-10-11", experience: "3-5 năm" },
  { id: 12, title: "QA Engineer", company: "Company L", location: "Hà Nội", salary: "19,000,000 VND", datePosted: "2024-10-12", experience: "2-4 năm" },
];

const JobsList = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // State để lưu trữ từ khóa tìm kiếm
  const jobsPerPage = 5;

  // Tìm kiếm dựa trên từ khóa
  const filteredJobs = jobData.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính tổng số trang sau khi tìm kiếm
  const totalFilteredPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Tính công việc hiện tại dựa trên trang hiện tại
  const currentJobs = filteredJobs.slice(
    currentPage * jobsPerPage,
    currentPage * jobsPerPage + jobsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalFilteredPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e:any) => {
    setSearchTerm(e.target.value); // Cập nhật từ khóa tìm kiếm
    setCurrentPage(0); // Quay lại trang 1 khi tìm kiếm
  };

  return (
    <div>
      <h1>Danh sách công việc</h1>
      {/* Ô tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm kiếm theo tiêu đề công việc..."
        value={searchTerm}
        onChange={handleSearchChange} // Gọi hàm xử lý tìm kiếm
        style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
      />
      <table className="jobs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên Công Việc</th>
            <th>Công Ty</th>
            <th>Địa Điểm</th>
            <th>Mức Lương</th>
            <th>Ngày Đăng</th>
            <th>Kinh Nghiệm</th>
          </tr>
        </thead>
        <tbody>
          {currentJobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.title}</td>
              <td>{job.company}</td>
              <td>{job.location}</td>
              <td>{job.salary}</td>
              <td>{job.datePosted}</td>
              <td>{job.experience}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button className="mr-11" onClick={handlePrevPage} disabled={currentPage === 0}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={currentPage === totalFilteredPages - 1}>
          Next
        </button>
        <p>
          Trang {currentPage + 1} / {totalFilteredPages}
        </p>
      </div>
    </div>
  );
};

export default JobsList;

