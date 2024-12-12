"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  FaBriefcase, 
  FaEye, 
  FaUserClock, 
  FaChartLine,
  FaBell,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaBuilding,
  FaEnvelope,
  FaCalendarCheck,
  FaUserTie,
  FaLock,
  FaGlobe,
  FaSpinner
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import jobApiRequest from "@/app/apiRequest/job";
import applyApiRequest from "@/app/apiRequest/apply";
import candidateApiRequest from "@/app/apiRequest/candidate";
import cvApiRequest from "@/app/apiRequest/cv";
import { JobListResType } from "@/app/schemaValidations/job.schema";
import { ApplyListResType } from "@/app/schemaValidations/apply.schema";
import { toast } from "react-toastify";
import employer from "@/app/apiRequest/employer";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobListResType["data"]>([]);
  const [applications, setApplications] = useState<ApplyListResType["data"]>([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    viewsToday: 0,
    applicationsThisWeek: 0,
    jobsGrowth: 0,
    viewsGrowth: 0
  });
  const [applicationDetails, setApplicationDetails] = useState<{
    [key: number]: { jobTitle: string; candidateName: string }
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get employer ID from cookie or context
        const userId = parseInt(document.cookie.replace(/(?:(?:^|.*;\s*)userId\s*=\s*([^;]*).*$)|^.*$/, "$1"), 10);
        const sessionToken = document.cookie.replace(/(?:(?:^|.*;\s*)sessionToken\s*=\s*([^;]*).*$)|^.*$/, "$1");

        if (!userId || !sessionToken) {
          toast.error("Vui lòng đăng nhập lại");
          router.push("/login");
          return;
        }

        // Fetch jobs
        const jobsResponse = await jobApiRequest.getAllJobById(userId, sessionToken);
        const jobsData = Array.isArray(jobsResponse.payload.data) 
          ? jobsResponse.payload.data 
          : [jobsResponse.payload.data];
        setJobs(jobsData);

        // Fetch applications
        const applicationsResponse = await applyApiRequest.getAppliesByEmployerId(userId);
        const applicationsData = Array.isArray(applicationsResponse.payload.data)
          ? applicationsResponse.payload.data
          : [applicationsResponse.payload.data];
        setApplications(applicationsData);

        // Calculate stats
        const activeJobsCount = jobsData.filter(job => job.status === 1).length;
        const totalViews = jobsData.reduce((sum, job) => sum + (job.views || 0), 0);
        const recentApplications = applicationsData.filter(app => {
          const appDate = new Date(app.applyDate);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return appDate >= weekAgo;
        }).length;

        setStats({
          activeJobs: activeJobsCount,
          totalApplications: applicationsData.length,
          viewsToday: totalViews,
          applicationsThisWeek: recentApplications,
          jobsGrowth: 0, 
          viewsGrowth: 0 
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      const details: { [key: number]: { jobTitle: string; candidateName: string } } = {};
      const sessionToken = document.cookie.replace(/(?:(?:^|.*;\s*)sessionToken\s*=\s*([^;]*).*$)|^.*$/, "$1");
      
      for (const app of applications) {
        let jobTitle = "Đang tải...";
        let candidateName = "Đang tải...";

        try {
          // Fetch job details
          const jobResponse = await jobApiRequest.getJobById(app.jobId);
          jobTitle = jobResponse.payload.data.title;
        } catch (error) {
          console.error("Error fetching job details:", error);
          jobTitle = "Không thể tải thông tin công việc";
        }

        try {
          // Fetch candidate details
          const candidateResponse = await candidateApiRequest.getAllCandidate(sessionToken);
          const candidates = Array.isArray(candidateResponse.payload.data) 
            ? candidateResponse.payload.data 
            : [candidateResponse.payload.data];
          
          // Find the candidate that matches the CV's candidateId
          const cvResponse = await cvApiRequest.getCvById(app.candidateCvId, sessionToken);
          const candidateId = cvResponse.payload.data.candidate_id;
          const candidate = candidates.find(c => c.candidateId === candidateId);
          candidateName = candidate ? candidate.fullName : 'Không tìm thấy thông tin ứng viên';
        } catch (error) {
          console.error("Error fetching candidate details:", error);
          candidateName = "Không thể tải thông tin ứng viên";
        }

        details[app.applyId] = { jobTitle, candidateName };
      }
      
      setApplicationDetails(details);
    };

    if (applications.length > 0) {
      fetchApplicationDetails();
    }
  }, [applications]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Trang quản lý</h1>
              <p className="mt-1 text-blue-100">Chào mừng trở lại!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-white p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors relative">
                <FaBell className="h-5 w-5" />
                {applications.some(app => app.status === 0) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <Link 
                href="/employer/jobs/add" 
                className="bg-white text-blue-600 hover:bg-blue-50 transition-colors px-4 py-2 rounded-lg font-medium flex items-center"
              >
                <FaBriefcase className="mr-2" />
                Đăng tin tuyển dụng
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Company Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <FaBuilding className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{jobs[0]?.companyName || "Chưa cập nhật tên công ty"}</h2>
                  <p className="text-gray-500 flex items-center mt-1">
                    <FaEnvelope className="mr-2" />
                    {jobs[0]?.contactEmail || "Chưa cập nhật email"}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link 
                    href="#"
                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaUserTie className="mr-2" />
                    Cập nhật hồ sơ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Active Jobs Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tin tuyển dụng đang hoạt động</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeJobs}</h3>
                <p className="text-blue-600 text-sm mt-2 flex items-center">
                  <FaBriefcase className="mr-1" />
                  Tổng {jobs.length} tin đăng
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaBriefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* New Applications Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Đơn ứng tuyển mới</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {applications.filter(app => app.status === 0).length}
                </h3>
                <p className="text-green-600 text-sm mt-2 flex items-center">
                  <FaUserClock className="mr-1" />
                  Tổng {stats.totalApplications} đơn
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FaUserClock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Expiring Jobs Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tin sắp hết hạn</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.filter(job => {
                    const expirationDate = new Date(job.expirationDate);
                    const today = new Date();
                    const daysUntilExpiration = Math.ceil(
                      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
                  }).length}
                </h3>
                <p className="text-yellow-600 text-sm mt-2 flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  Trong 7 ngày tới
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Đơn ứng tuyển gần đây</h2>
              <Link 
                href="/employer/jobs/applies" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Ứng viên</th>
                  <th className="px-6 py-3">Vị trí</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Ngày ứng tuyển</th>
                  <th className="px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.slice(0, 5).map((application) => (
                  <tr key={application.applyId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUserTie className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {applicationDetails[application.applyId]?.candidateName || `Đang tải...`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {applicationDetails[application.applyId]?.jobTitle || `Đang tải...`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 1
                          ? "bg-green-100 text-green-800"
                          : application.status === -1
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {application.status === 1 ? (
                          <><FaCheckCircle className="mr-1" />Đã duyệt</>
                        ) : application.status === -1 ? (
                          <><FaTimesCircle className="mr-1" />Từ chối</>
                        ) : (
                          <><FaClock className="mr-1" />Đang xem xét</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(application.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/employer/jobs/${application.jobId}/applies`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Chưa có đơn ứng tuyển nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Tin tuyển dụng</h2>
              <Link 
                href="/employer/jobs" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Vị trí</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Lượt xem</th>
                  <th className="px-6 py-3">Đơn ứng tuyển</th>
                  <th className="px-6 py-3">Ngày hết hạn</th>
                  <th className="px-6 py-3">Hiển thị</th>
                  <th className="px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      {(() => {
                        const today = new Date();
                        const expirationDate = new Date(job.expirationDate);
                        const daysUntilExpiration = Math.ceil(
                          (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                        );

                        if (expirationDate < today) {
                          return (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                              Hết hạn
                            </span>
                          );
                        } else if (daysUntilExpiration <= 7) {
                          return (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              Gần hết hạn ({daysUntilExpiration} ngày)
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {job.status === 1 ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                        {job.status === 1 ? "Đang hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaEye className="mr-1" />
                        {job.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUserClock className="mr-1" />
                        {applications.filter(app => app.jobId === job.jobId).length}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(job.expirationDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 1
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {job.status === 1 ? <FaGlobe className="mr-1" /> : <FaLock className="mr-1" />}
                        {job.status === 1 ? "Công khai" : "Riêng tư"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Link 
                          href={`/employer/jobs/${job.jobId}/edit`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Chỉnh sửa
                        </Link>
                        <button 
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                          onClick={() => {
                            // Handle refresh job
                          }}
                        >
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Chưa có tin tuyển dụng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
