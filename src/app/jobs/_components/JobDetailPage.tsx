"use client"; // Đánh dấu đây là Client Component
import {
  MdWork,
  MdLocationOn,
  MdAttachMoney,
  MdCalendarToday,
  MdBookmark,
} from "react-icons/md";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next"; // Import hàm getCookie từ cookies-next
import ApplyJobForm from "./ApplyJobForm";
import { JobResType } from "@/app/schemaValidations/job.schema";
import { useRouter } from "next/navigation";
import { CvListResType } from "@/app/schemaValidations/cv.schema";
import { TechListResType } from "@/app/schemaValidations/tech.schema";
import { useApplyContext } from "@/app/context/ApplyContext";
import ApiRequestSave from "@/app/apiRequest/save";
import { toast } from "react-toastify";

import Alert from "@/components/Alert";
import { getCompanyColor } from "@/components/HomePage";
import { FaGlobe, FaMapMarkerAlt } from "react-icons/fa";
import { useJobContext } from "@/app/context/JobContext";
import Link from "next/link";
import { Job } from "@/app/schemaValidations/job.schema";

const calculateDaysLeft = (expirationDate?: string | Date): number => {
  // Kiểm tra nếu expirationDate là undefined
  if (!expirationDate) {
    return 0; // Hoặc giá trị mặc định bạn muốn
  }

  // Ngày hiện tại
  const currentDate = new Date();

  // Chuyển expirationDate về đối tượng Date
  const endDate = new Date(expirationDate);

  // Kiểm tra xem ngày có hợp lệ không
  if (isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }

  // Tính số milliseconds giữa ngày hết hạn và ngày hiện tại
  const timeDiff = endDate.getTime() - currentDate.getTime();

  // Chuyển milliseconds thành ngày
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysLeft;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export default function JobsPage({
  job,
  cvList,
  candidateId,
  tech,
}: {
  job: JobResType["data"] | null;
  cvList: CvListResType["data"] | null;
  candidateId: number | null;
  tech: TechListResType["data"] | null;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { jobListContext } = useJobContext();
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);

  const handleOpenModal = () => {
    const username = getCookie("username"); // Lấy giá trị username từ cookie
    console.log("username:", username); // Kiểm tra giá trị username trong cookie

    if (!username) {
      alert("Bạn cần đăng nhập để nộp đơn."); // Thông báo nếu chưa đăng nhập
      router.push("/login"); // Điều hướng đến trang đăng nhập
    } else {
      setIsModalOpen(true); // Mở modal nếu đã đăng nhập
    }
  };

  useEffect(() => {
    const username = getCookie("username"); // Kiểm tra xem username có trong cookie chưa
    console.log("Updated username:", username); // Kiểm tra xem username đã cập nhật chưa
  }, []);

  const handleSaveJob = async () => {
    const username = getCookie("username");

    if (!username) {
      alert("Bạn cần đăng nhập để lưu công việc.");
      router.push("/login");
      return;
    }

    if (!candidateId || !job?.jobId) {
      alert("Thiếu thông tin cần thiết để lưu công việc.");
      return;
    }

    try {
      const response = await ApiRequestSave.CreateSave({
        candidateId,
        jobId: job.jobId,
        Date: new Date().toISOString(),
      });

      if (response.status === 200) {
       Alert.success("success","Công việc đã lưu thành công");
      }
    } catch (error) {
      Alert.error("error", "Công việc đã được lưu")
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Đóng modal
  };

  const daysLeft = calculateDaysLeft(job?.expirationDate);
  console.log("Time from now to " + job?.expirationDate + " : " + daysLeft);


  const { checkApplicationStatus } = useApplyContext(); // Lấy hàm kiểm tra trạng thái ứng tuyển từ context
  const [isApplied, setIsApplied] = useState(false); // Lưu trạng thái ứng tuyển

  useEffect(() => {
    // Kiểm tra trạng thái ứng tuyển khi jobId thay đổi
    const checkStatus = async () => {
      if (job?.jobId) {
        const status = await checkApplicationStatus(job.jobId);
        console.log("jobID:" + job.jobId);
        console.log("status apply:" + status);
        setIsApplied(status); // Cập nhật trạng thái ứng tuyển
      }
    };

    checkStatus();
  }, [job?.jobId, checkApplicationStatus]); // Chạy lại khi jobId thay đổi

  useEffect(() => {
    if (job && jobListContext) {
      // Lọc các công việc tương tự dựa trên:
      // 1. Cùng công nghệ
      // 2. Cùng vị trí công việc
      // 3. Cùng loại công việc
      // 4. Không bao gồm công việc hiện tại
      const filtered = jobListContext.filter(j => 
        j.jobId !== job.jobId && // Không lấy công việc hiện tại
        (
          j.title.toLowerCase().includes(job.title.toLowerCase()) || // Cùng vị trí
          j.jobType === job.jobType || // Cùng loại công việc
          j.jobRank === job.jobRank || // Cùng cấp bậc
          tech?.some(t => j.title.toLowerCase().includes(t.name.toLowerCase())) // Cùng công nghệ
        )
      );

      // Lấy tối đa 4 công việc đề xuất
      setSuggestedJobs(filtered.slice(0, 4));
    }
  }, [job, jobListContext, tech]);

  return (
    <>
      <div className="flex flex-wrap max-w-6xl mx-auto p-4">
        {/* Cột 1: Job Post */}
        <div className="job-post mb-4 bg-white shadow-xl shadow-gray-200 w-full md:w-8/12 mr-4">
          {" "}
          {/* Thêm margin-right cho cột 1 */}
          {/* Banner Image */}
          

          {/* New Job Post: IT Security Manager */}
          <div className="job-meta mb-8 text-xs p-4">
            <h1 className="job-title mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              {job?.title}
            </h1>

            <div className="flex flex-wrap gap-4 mb-4">
              <span className="flex items-center rounded-full bg-teal-100 px-4 py-2 text-sm text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                <MdWork className="mr-2" />
                {job?.jobType}
              </span>
              <span className="flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <MdLocationOn className="mr-2" />
                {job?.jobLocation}
              </span>
              <span className="flex items-center rounded-full bg-green-100 px-4 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <MdAttachMoney className="mr-2" />
                {job?.salary ? formatCurrency(job.salary) : 'Thương lượng'} VND
              </span>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
              <MdCalendarToday className="mr-2" />
              <span>
                Ngày đăng tuyển: <span className="font-medium">{job?.postingDate ? new Date(job.postingDate).toLocaleDateString('vi-VN') : 'N/A'}</span> |
                Ngày hết hạn: <span className="font-medium">{job?.expirationDate ? new Date(job.expirationDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </span>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MdWork className="mr-2" />
              <span>Số lượng tuyển: <span className="font-medium">{job?.numberOfRecruitment} Người</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-2 m-4">
            <a
              href="#"
              className={`flex items-center justify-center rounded-lg border-2 ${isApplied
                  ? "bg-gray-500 text-white cursor-not-allowed" // Trạng thái vô hiệu hóa
                  : "border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                } px-6 py-3 transition-all`}
              onClick={isApplied ? undefined : handleOpenModal} // Vô hiệu hóa click khi đã ứng tuyển
              aria-disabled={isApplied} // Thuộc tính trợ năng
            >
              {isApplied ? "Bạn đã ứng tuyển" : "Nộp đơn ngay"}
            </a>

            <button
              onClick={handleSaveJob}
              className="flex items-center justify-center rounded-lg border-2 border-teal-600 px-6 py-3 text-teal-600 transition-all hover:bg-teal-50 dark:hover:bg-teal-900/20"
            >
              <MdBookmark className="mr-2" />
              Lưu công việc
            </button>

          </div>
          <div className="job-description m-4">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">
              Mô tả công việc
            </h3>
            <ul className="list-disc ml-6 m-2">{job?.jobDescription}</ul>
          </div>
          <div className="job-skills m-4">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">
              Kỹ năng yêu cầu
            </h3>
            <ul className="list-disc ml-6 m-2">{job?.jobRequirements}</ul>
            <ul className="list-disc ml-6">
              <li className="list-disc ml-6 m-2">
                Trình độ học vấn: {job?.educationLevel}
              </li>

              <li className="list-disc ml-6 m-2">
                Công nghệ: {tech?.map((t) => t.name).join(", ")}
              </li>

              <li className="list-disc ml-6 m-2">
                Kinh nghiệm: {job?.levelName}
              </li>
              <li className="list-disc ml-6 mb-2">Cấp bậc: {job?.jobRank}</li>
              <li className="list-disc ml-6 mb-2">Giới tính: {job?.gender}</li>
            </ul>
          </div>
          <div className="job-benefits mb-4">
            <h3 className="text-xl font-semibold text-purple-800 m-4">
              Quyền lợi
            </h3>
            <ul className="list-disc ml-6 m-2">{job?.benefits}</ul>
          </div>
          <div className="job-contact m-4">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">
              Thông tin liên hệ
            </h3>
            <p className="list-disc ml-6 mb-2">
              Người liên hệ: {job?.contactPerson}
            </p>
            <p className="list-disc ml-6 mb-2">
              Số điện thoại: {job?.contactPhone}
            </p>
            <p className="list-disc ml-6 mb-2">
              Email liên hệ: {job?.contactEmail}
            </p>
            <p className="list-disc ml-6 mb-2">
              Địa chỉ liên hệ: {job?.contactAddress}
            </p>
          </div>
          <div className="job-contact m-4">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">
              Thông tin công ty
            </h3>
            <p className="list-disc ml-6 mb-2">Công ty: {job?.companyName}</p>
            <p className="list-disc ml-6 mb-2">
              Số lượng nhân viên: {job?.numberOfEmployees}
            </p>
            <p className="list-disc ml-6 mb-2">
              Website công ty: {job?.companyWebsite}
            </p>
            <p className="list-disc ml-6 mb-2">
              Sơ lược công ty: {job?.companyOverview}
            </p>
            <p className="list-disc ml-6 mb-2">
              Địa chỉ: {job?.contactAddress}
            </p>
          </div>
        </div>{" "}
        {/* end job-post */}
        {/* Cột 2: Đề xuất công việc */}
        <div className="w-full hidden md:block md:w-3/12">
          <div className="bg-white shadow-xl shadow-gray-200 w-full max-w-xs p-6 rounded-md">
            <div className="px-4 py-6 border-b">
              <div className="flex items-center gap-4">
                <div className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${job?.companyName ? getCompanyColor(job.companyName) : 'from-gray-500 to-gray-600'} flex items-center justify-center text-white font-bold text-2xl shadow-md`}>
                  {job?.companyName ? job.companyName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {job?.companyName}
                  </h1>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span>{job?.contactAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaGlobe className="text-gray-400" />
                      <span>{job?.companyWebsite}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-purple-800 mb-4">Đề xuất công việc</h2>

            {suggestedJobs.length > 0 ? (
              <ul className="space-y-4">
                {suggestedJobs.map((job) => (
                  <li key={job.jobId} className="border-b pb-2">
                    <Link href={`/jobs/${job.jobId}`} className="hover:underline">
                      <h4 className="font-bold">{job.title}</h4>
                      <p className="text-slate-600 text-sm">{job.jobLocation}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-sm">
                          {job.jobType}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(job.salary)} VND
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">Không có công việc tương tự</p>
            )}
          </div>
        </div>{" "}
        {/* end suggested jobs */}
        {/* Modal Apply Job Form */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <ApplyJobForm
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              cvList={cvList} // Truyền cvList vào đây
              candidateId={candidateId}
              job={job}
            />
          </div>
        )}
      </div>
    </>
  );
}
