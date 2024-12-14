"use client";
import jobApiRequest from "@/app/apiRequest/job";
import { useJobContext } from "@/app/context/JobContext";
import React, { useState } from "react";
import Alert from "@/components/Alert";
import { MdWork, MdLocationOn, MdAttachMoney, MdCalendarToday, MdCardGiftcard } from "react-icons/md";
import { 
  FaClipboardList, 
  FaUsers, 
  FaTimesCircle, 
  FaCheck, 
  FaExclamationTriangle, 
  FaClock,
  FaFlag,
  FaEye,
  FaClipboardCheck,
  FaCheckCircle,
  FaBuilding,
  FaMoneyBillWave,
  FaBriefcase,
  FaGraduationCap,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaInfoCircle,
  FaAddressCard,
  FaRegClock,
  FaHashtag,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaBan,
  FaTimes,
  FaStar,
  FaUserCheck,
  FaHome,
  FaTrash,
  FaExternalLinkAlt,
  FaCalendarAlt
} from "react-icons/fa";
import { MessageUtils } from "@/utils/messageUtils";
import { Job } from "@/app/context/JobContext";

interface JobViolation {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface JobRequirement {
  id: string;
  label: string;
  description: string;
  isRequired: boolean;
  validate: (job: any) => boolean;
}

const JOB_REQUIREMENTS: JobRequirement[] = [
  {
    id: 'title',
    label: 'Tiêu đề công việc',
    description: 'Tiêu đề phải rõ ràng, không chứa từ khóa cấm',
    isRequired: true,
    validate: (job) => {
      const bannedWords = ['gấp', 'urgent', 'hot', '$$$'];
      return !bannedWords.some(word => 
        job.title.toLowerCase().includes(word.toLowerCase())
      );
    }
  },
  {
    id: 'salary',
    label: 'Mức lương',
    description: 'Mức lương phải phù hợp với thị trường (>= 1,000,000 VND)',
    isRequired: true,
    validate: (job) => job.salary >= 1000000
  },
  {
    id: 'description',
    label: 'Mô tả công việc',
    description: 'Mô tả công việc phải chi tiết (ít nhất 50 ký tự)',
    isRequired: true,
    validate: (job) => job.description && job.description.length >= 50
  },
  {
    id: 'requirements',
    label: 'Yêu cầu ứng viên',
    description: 'Yêu cầu ứng viên phải rõ ràng (ít nhất 50 ký tự)',
    isRequired: true,
    validate: (job) => job.requirements && job.requirements.length >= 50
  },
  {
    id: 'expiration',
    label: 'Thời hạn ứng tuyển',
    description: 'Thời hạn ứng tuyển phải hợp lý (7-60 ngày)',
    isRequired: true,
    validate: (job) => {
      const daysLeft = calculateDaysLeft(job.postingDate, job.expirationDate);
      return daysLeft >= 7 && daysLeft <= 60;
    }
  }
];

const calculateDaysLeft = (
  postingDate?: string | Date,
  expirationDate?: string | Date
): number => {
  // Kiểm tra nếu một trong hai ngày là undefined
  if (!postingDate || !expirationDate) {
    return 0; // Hoặc giá trị nào bạn muốn khi không có đủ ngày
  }

  // Chuyển đổi về đối tượng Date
  const startDate = new Date(postingDate);
  const endDate = new Date(expirationDate);

  // Kiểm tra xem các ngày có hợp lệ không
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }

  // Tính số milliseconds giữa hai ngày
  const timeDiff = endDate.getTime() - startDate.getTime();

  // Chuyển milliseconds thành ngày
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysLeft;
};

export default function JobPostsManagementPage() {
  const { allJobListContext, setAllJobList } = useJobContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(3);
  const [filterTimeframe, setFilterTimeframe] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Giả lập kiểm tra vi phạm 
  const checkViolations = (job: any): JobViolation[] => {
    const violations: JobViolation[] = [];
    
    // Kiểm tra mức lương
    if (job.salary < 1000000) {
      violations.push({
        type: 'Mức lương',
        description: 'Mức lương được đề xuất quá thấp (dưới 1 triệu VNĐ)',
        severity: 'medium'
      });
    }

    if (job.salary > 100000000) {
      violations.push({
        type: 'Mức lương',
        description: 'Mức lương được đề xuất quá cao (trên 100 triệu VNĐ), vui lòng kiểm tra lại',
        severity: 'low'
      });
    }
    
    // Kiểm tra tiêu đề
    const bannedTitleWords = ['urgent', 'gấp', 'hot', 'khẩn', 'nhanh', 'siêu'];
    const titleLower = job.title.toLowerCase();
    for (const word of bannedTitleWords) {
      if (titleLower.includes(word)) {
        violations.push({
          type: 'Tiêu đề',
          description: `Tiêu đề có chứa từ khóa cấm: "${word}"`,
          severity: 'high'
        });
        break;
      }
    }

    // Kiểm tra độ dài tiêu đề
    if (job.title.length < 20) {
      violations.push({
        type: 'Tiêu đề',
        description: 'Tiêu đề quá ngắn (dưới 20 ký tự)',
        severity: 'medium'
      });
    }

    if (job.title.length > 150) {
      violations.push({
        type: 'Tiêu đề',
        description: 'Tiêu đề quá dài (trên 150 ký tự)',
        severity: 'low'
      });
    }

    // Kiểm tra mô tả công việc
    if (!job.jobDescription || job.jobDescription.length < 50) {
      violations.push({
        type: 'Mô tả công việc',
        description: 'Mô tả công việc quá ngắn hoặc không có',
        severity: 'high'
      });
    }

    // Kiểm tra yêu cầu công việc
    if (!job.jobRequirements || job.jobRequirements.length < 50) {
      violations.push({
        type: 'Yêu cầu công việc',
        description: 'Yêu cầu công việc quá ngắn hoặc không có',
        severity: 'high'
      });
    }

    // Kiểm tra quyền lợi
    if (!job.benefits || job.benefits.length < 50) {
      violations.push({
        type: 'Quyền lợi',
        description: 'Quyền lợi quá ít hoặc không có',
        severity: 'medium'
      });
    }

    // Kiểm tra thông tin liên hệ
    if (!job.contactEmail || !job.contactEmail.includes('@')) {
      violations.push({
        type: 'Email liên hệ',
        description: 'Email liên hệ không hợp lệ',
        severity: 'high'
      });
    }

    if (!job.contactPhone || !/^[0-9]{10,11}$/.test(job.contactPhone)) {
      violations.push({
        type: 'Số điện thoại',
        description: 'Số điện thoại không hợp lệ (cần 10-11 số)',
        severity: 'high'
      });
    }

    // Kiểm tra số lượng tuyển
    if (!job.numberOfRecruitment || job.numberOfRecruitment < 1) {
      violations.push({
        type: 'Số lượng tuyển',
        description: 'Số lượng tuyển dụng không hợp lệ',
        severity: 'medium'
      });
    }

    if (job.numberOfRecruitment > 100) {
      violations.push({
        type: 'Số lượng tuyển',
        description: 'Số lượng tuyển dụng quá lớn (trên 100), vui lòng kiểm tra lại',
        severity: 'low'
      });
    }

    // Kiểm tra địa điểm
    if (!job.jobLocation || job.jobLocation.length < 5) {
      violations.push({
        type: 'Địa điểm',
        description: 'Địa điểm làm việc không hợp lệ hoặc quá ngắn',
        severity: 'medium'
      });
    }

    // Kiểm tra thời gian đăng tin
    const postingDate = new Date(job.postingDate);
    const now = new Date();
    if (postingDate > now) {
      violations.push({
        type: 'Thời gian đăng',
        description: 'Thời gian đăng tin không hợp lệ (trong tương lai)',
        severity: 'medium'
      });
    }

    // Kiểm tra yêu cầu giới tính
    const gender = job.gender?.toLowerCase();
    if (gender && !['nam', 'nữ', 'không yêu cầu', 'nam/nữ', 'nam/nu'].includes(gender)) {
      violations.push({
        type: 'Yêu cầu giới tính',
        description: 'Yêu cầu giới tính không hợp lệ',
        severity: 'medium'
      });
    }

    // Kiểm tra độ tuổi (nếu có)
    if (job.minAge && job.minAge < 15) {
      violations.push({
        type: 'Độ tuổi',
        description: 'Độ tuổi tối thiểu không được dưới 15 tuổi',
        severity: 'high'
      });
    }

    if (job.maxAge && job.maxAge > 60) {
      violations.push({
        type: 'Độ tuổi',
        description: 'Độ tuổi tối đa không nên trên 60 tuổi',
        severity: 'medium'
      });
    }

    return violations;
  };

  const renderViolationSeverity = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetail = async (job: any) => {
    try {
      const response = await jobApiRequest.getJobById(job.jobId);
      if (response.payload && response.payload.data) {
        console.log('Job details:', response.payload.data);
        setSelectedJob(response.payload.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      Alert.error('Không thể lấy thông tin chi tiết công việc');
    }
  };

  const renderStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <FaCheck className="text-green-600 mr-2" />;
      case -1:
        return <FaTimesCircle className="text-red-600 mr-2" />;
      case 2:
        return <FaExclamationTriangle className="text-gray-600 mr-2" />;
      default:
        return <FaClock className="text-yellow-600 mr-2" />;
    }
  };

  const filteredJobPosts = allJobListContext
    ? allJobListContext
        .filter((post: Job) => {
          const matchesSearchTerm =
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.companyName.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesFilterStatus =
            filterStatus === 3 ? true : post.status === filterStatus;

          const matchesTimeframe = () => {
            const postingDate = new Date(post.postingDate);
            const today = new Date();

            switch (filterTimeframe) {
              case "1":
                return (
                  postingDate >= new Date(today.setDate(today.getDate() - 1))
                );
              case "3":
                return (
                  postingDate >= new Date(today.setDate(today.getDate() - 3))
                );
              case "5":
                return (
                  postingDate >= new Date(today.setDate(today.getDate() - 5))
                );
              case "7":
                return (
                  postingDate >= new Date(today.setDate(today.getDate() - 7))
                );
              case "15":
                return (
                  postingDate >= new Date(today.setDate(today.getDate() - 15))
                );
              case "1 tháng":
                return (
                  postingDate >= new Date(today.setMonth(today.getMonth() - 1))
                );
              default:
                return true;
            }
          };

          return matchesSearchTerm && matchesFilterStatus && matchesTimeframe();
        })
        .sort((a: Job, b: Job) => {
          const dateA = new Date(a.postingDate);
          const dateB = new Date(b.postingDate);
          return sortOrder === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        })
    : [];

  const handleStatusChange = async (jobId: number, newStatus: number) => {
    const confirmMessages = {
      "1": MessageUtils.getMessage("CONFIRM_JOB_APPROVE"),
      "-1": MessageUtils.getMessage("CONFIRM_JOB_REJECT"),
      "0": "Bạn có chắc chắn muốn đặt lại trạng thái chờ duyệt?"
    };

    const successMessages = {
      "1": MessageUtils.getMessage("SUCCESS_JOB_APPROVE"),
      "-1": MessageUtils.getMessage("SUCCESS_JOB_REJECT"),
      "0": "Đã đặt lại trạng thái chờ duyệt"
    };

    const errorMessages = {
      "1": MessageUtils.getMessage("ERROR_JOB_APPROVE"),
      "-1": MessageUtils.getMessage("ERROR_JOB_REJECT"),
      "0": "Có lỗi xảy ra khi đặt lại trạng thái"
    };

    const statusKey = String(newStatus) as keyof typeof confirmMessages;
    if (window.confirm(confirmMessages[statusKey])) {
      try {
        await jobApiRequest.updateJobStatus(jobId, newStatus);
        Alert.success(successMessages[statusKey]);
        // Cập nhật trực tiếp trong context
        if (allJobListContext && setAllJobList) {
          const updatedJobs = allJobListContext.map(job => 
            job.jobId === jobId ? { ...job, status: newStatus } : job
          );
          setAllJobList(updatedJobs);
        }
      } catch (error) {
        console.error(`Error updating job status to ${newStatus}:`, error);
        Alert.error(errorMessages[statusKey]);
      }
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Mở modal chi tiết
  const openDetailModal = async (job: any) => {
    try {
      // Lấy chi tiết job từ API
      const response = await jobApiRequest.getJobById(job.jobId);
      if (response.payload && response.payload.data) {
        console.log('Job details:', response.payload.data);
        setSelectedJob(response.payload.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      Alert.error('Không th lấy thông tin chi tiết công việc');
    }
  };

  // Hiển thị nội dung có format
  const formatContent = (content: string | undefined) => {
    if (!content) return ["Chưa có thông tin"];
    // Tách nội dung thành các dòng và loại bỏ dòng trống
    return content.split('\n').filter(line => line.trim() !== '');
  };

  // Thêm hàm xử lý cập nhật trạng thái từ modal
  const handleStatusChangeFromModal = async () => {
    if (!selectedJob) return;
    
    try {
      const newStatus = selectedJob.status === 1 ? -1 : 1;
      await jobApiRequest.updateJobStatus(selectedJob.jobId, newStatus);
      
      // Update context state immediately
      setAllJobList?.(prevJobs => 
        prevJobs?.map(job => 
          job.jobId === selectedJob.jobId 
            ? { ...job, status: newStatus }
            : job
        ) || []
      );

      Alert.success("Cập nhật trạng thái thành công");
    } catch (error) {
      Alert.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleApproveJob = async (jobId: number) => {
    if (window.confirm(MessageUtils.getMessage("CONFIRM_JOB_APPROVE"))) {
      try {
        await jobApiRequest.updateJobStatus(jobId, 1);
        Alert.success(MessageUtils.getMessage("SUCCESS_JOB_APPROVE"));
        if (allJobListContext && setAllJobList) {
          const updatedJobs = allJobListContext.map(job => 
            job.jobId === jobId ? { ...job, status: 1 } : job
          );
          setAllJobList(updatedJobs);
        }
      } catch (error) {
        console.error("Error approving job:", error);
        Alert.error(MessageUtils.getMessage("ERROR_JOB_APPROVE"));
      }
    }
  };

  const handleRejectJob = async (jobId: number) => {
    if (window.confirm(MessageUtils.getMessage("CONFIRM_JOB_REJECT"))) {
      try {
        await jobApiRequest.updateJobStatus(jobId, -1);
        Alert.success(MessageUtils.getMessage("SUCCESS_JOB_REJECT"));
        if (allJobListContext && setAllJobList) {
          const updatedJobs = allJobListContext.map(job => 
            job.jobId === jobId ? { ...job, status: -1 } : job
          );
          setAllJobList(updatedJobs);
        }
      } catch (error) {
        console.error("Error rejecting job:", error);
        Alert.error(MessageUtils.getMessage("ERROR_JOB_REJECT"));
      }
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobApiRequest.getAllJob();
      if (Array.isArray(response.payload.data)) {
        setJobs(response.payload.data);
      } else {
        setJobs([response.payload.data]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      Alert.error(MessageUtils.getMessage("ERROR_JOB_LOAD"));
    }
  };

  // Tính toán số trang và danh sách công việc hiện tại
  const totalPages = Math.ceil(filteredJobPosts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobPosts.slice(indexOfFirstItem, indexOfLastItem);

  // Hàm chuyển trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-grow h-screen overflow-y-auto hide-scrollbar text-xs p-0">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg rounded-lg p-6 mb-8 text-white">
        <h1 className="text-3xl font-semibold">
          Quản lý các bài đăng công việc
        </h1>
        <p className="text-lg mt-2">
          Kiểm tra và duyệt các bài đăng từ nhà tuyển dụng
        </p>
      </div>

      <div className="container mx-auto overflow-hidden">
        <div className="mb-4 flex space-x-4">
          <input
            type="text"
            placeholder="Tìm kiếm công việc hoặc nhà tuyển dụng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-1/4"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value={3}>Xem tất cả</option>
            <option value={0}>Đang chờ duyệt</option>
            <option value={1}>Đã duyệt</option>
            <option value={-1}>Bị từ chối</option>
            <option value={2}>Công việc đã hết hạn</option>
          </select>
          <select
            value={filterTimeframe}
            onChange={(e) => setFilterTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="1">Trong 1 ngày</option>
            <option value="3">Trong 3 ngày</option>
            <option value="5">Trong 5 ngày</option>
            <option value="7">Trong 7 ngày</option>
            <option value="15">Trong 15 ngày</option>
            <option value="1 tháng">Trong 1 tháng</option>
          </select>
        </div>

        <div className="overflow-y-auto hide-scrollbar max-h-[calc(100vh-200px)]">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full table-fixed">
              <thead className="bg-blue-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700">Tiêu đề</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700">Công ty</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700">Ngày đăng</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700">Trạng thái</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700">Thay đổi trạng thái</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((post) => {
                  const violations = checkViolations(post);
                  return (
                    <tr key={post.jobId} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800">{post.title}</span>
                          {violations.length > 0 && (
                            <FaFlag className="ml-2 text-red-500" title="Có dấu hiệu vi phạm" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{post.companyName}</td>
                      <td className="py-3 px-4">{post.postingDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {renderStatusIcon(post.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            post.status === 1
                              ? "bg-green-200 text-green-800"
                              : post.status === -1
                              ? "bg-red-200 text-red-800"
                              : post.status === 2
                              ? "bg-gray-200 text-gray-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}>
                            {post.status === 1
                              ? "Đã duyệt"
                              : post.status === -1
                              ? "Bị từ chối"
                              : post.status === 2
                              ? "Công việc đã hết hạn"
                              : "Đang chờ duyệt"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={post.status === 2 ? 2 : post.status}
                          onChange={(e) => {
                            if (post.status !== 2) {
                              const newStatus = Number(e.target.value);
                              if (newStatus === 1) {
                                handleApproveJob(post.jobId);
                              } else if (newStatus === -1) {
                                handleRejectJob(post.jobId);
                              } else {
                                handleStatusChange(post.jobId, newStatus);
                              }
                            }
                          }}
                          className="border border-gray-300 rounded-md p-2 text-sm"
                          disabled={post.status === 2}
                        >
                          <option value={1}>Đã duyệt</option>
                          <option value={0}>Đang chờ duyệt</option>
                          <option value={-1}>Bị từ chối</option>
                          {post.status === 2 && <option value={2}>Đã hết hạn</option>}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetail(post)}
                          className="w-full bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          Xem chi tiết
                          <FaExternalLinkAlt className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Phân trang */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredJobPosts.length)} trong {filteredJobPosts.length} kết quả
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết công việc */}
      {isDetailModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-xl w-full max-w-[95vw] max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b shadow-sm z-10">
              <div className="flex justify-between items-center p-3">
                {/* Left side - ID & Status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>ID: {selectedJob.jobId}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                    selectedJob.status === 1
                      ? "bg-green-50 text-green-700"
                      : selectedJob.status === -1
                      ? "bg-red-50 text-red-700"
                      : selectedJob.status === 2
                      ? "bg-gray-50 text-gray-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {selectedJob.status === 1 ? (
                      <><FaCheckCircle className="w-3 h-3" /> Đã duyệt</>
                    ) : selectedJob.status === -1 ? (
                      <><FaTimesCircle className="w-3 h-3" /> Bị từ chối</>
                    ) : selectedJob.status === 2 ? (
                      <><FaClock className="w-3 h-3" /> Đã hết hạn</>
                    ) : (
                      <><FaHourglassHalf className="w-3 h-3" /> Đang chờ duyệt</>
                    )}
                  </span>
                </div>

                {/* Right side - Stats & Actions */}
                <div className="flex items-center gap-2">
                  {/* Quick Stats */}
                  <div className="flex items-center gap-3 mr-3 text-sm">
                    <div className="flex items-center gap-1 text-blue-600">
                      <FaEye className="w-4 h-4" />
                      <span>{selectedJob.views || 0}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={handleStatusChangeFromModal}
                    disabled={selectedJob.status === 2} // Disable nếu công việc đã hết hạn
                    className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1 ${
                      selectedJob.status === 1
                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    } transition-colors`}
                  >
                    {selectedJob.status === 1 ? (
                      <><FaBan className="w-3.5 h-3.5" /> Từ chối</>
                    ) : (
                      <><FaCheck className="w-3.5 h-3.5" /> Duyệt</>
                    )}
                  </button>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content - 3 columns */}
            <div className="grid grid-cols-3 h-[calc(90vh-88px)]">
              {/* Column 1: Job Details */}
              <div className="border-r bg-white overflow-y-auto">
                {/* Job Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold text-gray-900 truncate max-w-xl">{selectedJob.title}</h2>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-gray-600 truncate flex items-center"><FaHome className="text-xl text-gray-400 mr-2" />{selectedJob.companyName}</span>  
                        <span className="inline-flex items-center gap-1">
                          <FaRegClock className="w-4 h-4" />
                          {new Date(selectedJob.postingDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FaCalendarAlt className="w-4 h-4" />
                          {new Date(selectedJob.expirationDate).toLocaleDateString('vi-VN')}
                        </span>                      
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Content */}
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <FaInfoCircle className="mr-2 text-blue-600" />
                      Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <MdLocationOn className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.jobLocation}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaMoneyBillWave className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.salary?.toLocaleString()} VND</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaUsers className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.numberOfRecruitment} người</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <FaBriefcase className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.jobType}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaGraduationCap className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.educationLevel}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaClock className="w-5 h-5 mr-2 text-gray-400" />
                          <span>{selectedJob.levelName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <MdWork className="mr-2 text-blue-600" />
                      Mô tả công việc
                    </h3>
                    <div className="prose max-w-none">
                      {selectedJob.jobDescription?.split('\n').map((paragraph: string, idx: number) => (
                        <p key={idx} className="text-gray-600 leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <FaClipboardList className="mr-2 text-green-600" />
                      Yêu cầu ứng viên
                    </h3>
                    <div className="prose max-w-none">
                      {selectedJob.jobRequirements?.split('\n').map((req: string, idx: number) => (
                        <p key={idx} className="text-gray-600 leading-relaxed">{req}</p>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <MdCardGiftcard className="mr-2 text-purple-600" />
                      Quyền lợi
                    </h3>
                    <div className="prose max-w-none">
                      {selectedJob.benefits?.split('\n').map((benefit: string, idx: number) => (
                        <p key={idx} className="text-gray-600 leading-relaxed">{benefit}</p>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <FaAddressCard className="mr-2 text-blue-600" />
                      Thông tin liên hệ
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <FaUser className="w-5 h-5 mr-2 text-gray-400" />
                        <span>{selectedJob.contactPerson}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaEnvelope className="w-5 h-5 mr-2 text-gray-400" />
                        <span className="truncate">{selectedJob.contactEmail}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaPhone className="w-5 h-5 mr-2 text-gray-400" />
                        <span>{selectedJob.contactPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Requirements Check */}
              <div className="border-r overflow-y-auto">
                <div className="p-6">
                  <div className="bg-white rounded-lg border p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <FaClipboardCheck className="mr-2 text-blue-600" />
                      Kiểm tra yêu cầu bài đăng
                    </h3>
                    <div className="space-y-3">
                      {JOB_REQUIREMENTS.map(req => {
                        const isValid = req.validate(selectedJob);
                        return (
                          <div 
                            key={req.id}
                            className={`p-3 rounded-lg border ${
                              isValid 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {isValid ? (
                                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                                ) : (
                                  <FaTimesCircle className="text-red-500 mr-2 flex-shrink-0" />
                                )}
                                <div>
                                  <h4 className="font-medium text-gray-900">{req.label}</h4>
                                  <p className="text-sm text-gray-600">{req.description}</p>
                                </div>
                              </div>
                              {req.isRequired && !isValid && (
                                <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded ml-2 flex-shrink-0">
                                  Bắt buộc
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Violations */}
              <div className="overflow-y-auto">
                <div className="p-6">
                  {checkViolations(selectedJob).length > 0 ? (
                    <div className="bg-white rounded-lg border border-red-200 p-6 space-y-4">
                      <h3 className="font-semibold text-red-800 flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        Dấu hiệu vi phạm
                      </h3>
                      <div className="space-y-3">
                        {checkViolations(selectedJob).map((violation, index) => (
                          <div key={index} className={`p-3 rounded-md ${renderViolationSeverity(violation.severity)}`}>
                            <span className="font-medium">{violation.type}:</span> {violation.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-green-200 p-6 space-y-4">
                      <h3 className="font-semibold text-green-800 flex items-center">
                        <FaCheckCircle className="mr-2" />
                        Không có dấu hiệu vi phạm
                      </h3>
                      <p className="text-gray-600">
                        Bài đăng này không có dấu hiệu vi phạm nào được phát hiện.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

