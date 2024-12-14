"use client";
import { getStatusLabel } from "@/app/schemaValidations/apply.schema";
import applyApiRequest from "@/app/apiRequest/apply";
import { useApplyContext, Apply } from "@/app/context/ApplyContext";
import { useState, useEffect } from "react";
import { FaEye, FaFileAlt, FaEnvelope, FaCalendarAlt, FaUserCircle, FaTimes, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaClock, FaSearch, FaCheckDouble, FaUserClock, FaChevronDown, FaCircle, FaCheck, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaBuilding, FaPhone, FaAddressCard, FaUser, FaClipboardList, FaUsers, FaHistory, FaSync } from "react-icons/fa";
import Alert from "@/components/Alert";
import cvApiRequest from "@/app/apiRequest/cv";
import jobApiRequest from "@/app/apiRequest/job";
import { MdLocationOn } from "react-icons/md";
import { MdCardGiftcard, MdWork } from "react-icons/md";

interface StatusHistory {
  status: number;
  date: string;
}

const StatusProgressBar = ({ currentStatus, statusHistory }: { currentStatus: number, statusHistory?: StatusHistory[] }) => {
  const steps = [
    { status: 0, label: 'Chờ xét duyệt', icon: FaClock, description: 'Đơn ứng tuyển đang chờ được xem xét' },
    { status: 1, label: 'Đang xem xét', icon: FaSearch, description: 'Nhà tuyển dụng đang xem xét hồ sơ' },
    { status: 2, label: 'Chờ phỏng vấn', icon: FaCalendarAlt, description: 'Ứng viên được mời phỏng vấn' },
    { status: 3, label: 'Phỏng vấn xong', icon: FaCheckCircle, description: 'Đã hoàn thành phỏng vấn' },
    { status: 4, label: 'Chờ quyết định', icon: FaUserClock, description: 'Đang chờ kết quả cuối cùng' },
    { status: 5, label: 'Đã tuyển dụng', icon: FaCheckDouble, description: 'Ứng viên đã được tuyển dụng' }
  ];

  const getStatusDate = (status: number) => {
    return statusHistory?.find(h => h.status === status)?.date;
  };

  const formatDate = (date: string) => {
    if (!date) return {
      full: '',
      time: '',
      date: ''
    };
    const d = new Date(date);
    return {
      full: d.toLocaleDateString('vi-VN', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  };

  return (
    <div className="space-y-8">
      {/* Main Progress Bar */}
      <div className="relative">
        {/* Background Track */}
        <div className="absolute top-[22px] left-0 right-0 h-0.5 bg-gray-200" />
        
        {/* Progress Track */}
        <div 
          className="absolute top-[22px] left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
          style={{ width: `${Math.min(100, (currentStatus / (steps.length - 1)) * 100)}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepDate = getStatusDate(step.status);
            const isCompleted = currentStatus > step.status;
            const isCurrent = currentStatus === step.status;
            const Icon = step.icon;
            
            return (
              <div key={step.status} className="flex flex-col items-center relative group">
                {/* Status circle */}
                <div 
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md' :
                      isCurrent ? 'bg-white border-2 border-blue-500 ring-4 ring-blue-50' : 
                      'bg-white border-2 border-gray-200'}`}
                >
                  <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : isCurrent ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                
                {/* Label and date */}
                <div className="mt-2 flex flex-col items-center">
                  <span className={`text-xs font-medium text-center
                    ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  {stepDate && (
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      {formatDate(stepDate).time}
                    </span>
                  )}
                </div>

                {/* Hover tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none min-w-[150px]">
                  <div className="bg-gray-900 text-white p-2 rounded-lg shadow-xl text-xs">
                    <div className="font-medium">{step.label}</div>
                    {stepDate && <div className="text-gray-300 text-[10px] mt-1">{formatDate(stepDate).full}</div>}
                  </div>
                  <div className="w-2 h-2 bg-gray-900 transform rotate-45 mx-auto mt-[-4px]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline History */}
      {statusHistory && statusHistory.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <FaHistory className="w-4 h-4 mr-2 text-blue-500" />
            Lịch sử cập nhật
          </h4>
          <div className="space-y-4">
            {[...statusHistory].reverse().map((history, index) => {
              const step = steps.find(s => s.status === history.status);
              const Icon = step?.icon || FaCircle;
              const formattedDate = formatDate(history.date);
              
              return (
                <div key={index} className="relative pl-7 pb-4 last:pb-0">
                  {/* Timeline line */}
                  {index !== statusHistory.length - 1 && (
                    <div className="absolute left-3 top-7 bottom-0 w-px bg-gradient-to-b from-blue-500/50 to-transparent" />
                  )}
                  
                  {/* Status icon */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center
                    ${history.status === 5 ? 'bg-green-500' :
                      history.status === -1 ? 'bg-red-500' :
                      'bg-blue-500'}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-sm font-medium text-gray-900">
                        {step?.label || getStatusLabel(history.status)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {formattedDate.time}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formattedDate.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface AppliesPageProps {
  applyList: Apply[];
  isLoading: boolean;
  onRefresh: () => void;
}

const validateStatusTransition = (currentStatus: number, newStatus: number): { valid: boolean; message?: string } => {
  // Không thể thay đổi nếu đã từ chối hoặc đã tuyển dụng
  if (currentStatus === -1 || currentStatus === 5) {
    return { valid: false, message: "Không thể thay đổi trạng thái của đơn đã kết thúc" };
  }

  // Chỉ có thể chuyển sang trạng thái kế tiếp
  if (newStatus > currentStatus + 1 && newStatus !== -1) {
    return { valid: false, message: "Không thể bỏ qua các bước trong quy trình" };
  }

  // Không thể quay lại trạng thái trước (trừ khi từ chối)
  if (newStatus < currentStatus && newStatus !== -1) {
    return { valid: false, message: "Không thể quay lại trạng thái trước" };
  }

  return { valid: true };
};

export default function AppliesPage({ applyList, isLoading, onRefresh }: AppliesPageProps) {
  const { setAppliesListByEmployerId } = useApplyContext();
  const [selectedApplication, setSelectedApplication] = useState<Apply | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isJobDetailModalOpen, setIsJobDetailModalOpen] = useState(false);

  const handleStatusChange = async (applicationId: number, newStatus: number) => {
    try {
      const currentApplication = applyList?.find(apply => apply.applyId === applicationId);
      if (!currentApplication) return;

      const validation = validateStatusTransition(currentApplication.status, newStatus);
      if (!validation.valid) {
        Alert.error(validation.message || "Không thể thay đổi trạng thái");
        return;
      }

      // Cập nhật UI ngay lập tức thông qua context
      setAppliesListByEmployerId(prevApplies => 
        prevApplies?.map(apply => 
          apply.applyId === applicationId 
            ? { ...apply, status: newStatus }
            : apply
        ) || []
      );

      // Cập nhật selectedApplication nếu đang mở modal
      if (selectedApplication?.applyId === applicationId) {
        setSelectedApplication(prev => prev ? {
          ...prev,
          status: newStatus,
          statusHistory: [
            ...(prev.statusHistory || []),
            { status: newStatus, date: new Date().toISOString() }
          ]
        } : null);
      }

      // Gọi API
      await applyApiRequest.updateApplyStatus(applicationId, newStatus);
      
      // Hiển thị thông báo thành công
      let successMessage = "";
      switch (newStatus) {
        case 1: successMessage = "Đã chuyển trạng thái sang đang xem xét"; break;
        case 2: successMessage = "Đã chuyển trạng thái sang chờ phỏng vấn"; break;
        case 3: successMessage = "Đã chuyển trạng thái sang phỏng vấn xong"; break;
        case 4: successMessage = "Đã chuyển trạng thái sang chờ quyết định"; break;
        case 5: successMessage = "Đã chuyển trạng thái sang đã tuyển dụng"; break;
        case -1: successMessage = "Đã từ chối ứng viên"; break;
        default: successMessage = "Đã cập nhật trạng thái thành công";
      }
      Alert.success(successMessage);

    } catch (error) {
      // Khôi phục trạng thái cũ nếu có lỗi
      const originalStatus = applyList?.find(apply => apply.applyId === applicationId)?.status || 0;
      
      setAppliesListByEmployerId(prevApplies => 
        prevApplies?.map(apply => 
          apply.applyId === applicationId 
            ? { ...apply, status: originalStatus }
            : apply
        ) || []
      );

      if (selectedApplication?.applyId === applicationId) {
        setSelectedApplication(prev => prev ? {
          ...prev,
          status: originalStatus
        } : null);
      }

      Alert.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case -1: return 'bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100';
      case 0: return 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100';
      case 1: return 'bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-100';
      case 2: return 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100';
      case 3: return 'bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100';
      case 4: return 'bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100';
      case 5: return 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100';
      default: return 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case -1: return <FaTimes className="w-4 h-4 text-rose-700" />;
      case 0: return <FaClock className="w-4 h-4 text-slate-700" />;
      case 1: return <FaSearch className="w-4 h-4 text-sky-700" />;
      case 2: return <FaCalendarAlt className="w-4 h-4 text-amber-700" />;
      case 3: return <FaCheckCircle className="w-4 h-4 text-violet-700" />;
      case 4: return <FaUserClock className="w-4 h-4 text-indigo-700" />;
      case 5: return <FaCheckDouble className="w-4 h-4 text-emerald-700" />;
      default: return <FaCircle className="w-4 h-4 text-slate-700" />;
    }
  };

  const handleViewDetail = async (application: any) => {
    try {
      // Kiểm tra xem đã có thông tin chi tiết chưa
      if (application.candidateName && application.jobTitle) {
        setSelectedApplication(application);
        return;
      }

      const sessionToken = localStorage.getItem('token') || '';
      
      // Load song song cả CV và Job info
      const [cvResponse, jobResponse] = await Promise.all([
        cvApiRequest.getCvById(application.candidateCvId, sessionToken),
        jobApiRequest.getJobById(application.jobId)
      ]);
      
      // Tạo object với thông tin chi tiết
      const detailedApplication = {
        ...application,
        candidateName: cvResponse.payload.data.fullName,
        email: cvResponse.payload.data.email,
        phone: cvResponse.payload.data.phone,
        jobTitle: jobResponse.payload.data.title
      };
      
      // Cập nhật vào state chính
      setAppliesListByEmployerId(prevList => 
        prevList ? prevList.map(item => 
          item.applyId === application.applyId ? detailedApplication : item
        ) : []
      );
      
      // Hiển thị modal với thông tin chi tiết
      setSelectedApplication(detailedApplication);
    } catch (error) {
      console.error('Error fetching application details:', error);
      Alert.error('Không thể lấy thông tin chi tiết đơn ứng tuyển');
    }
  };

  const handleViewCV = async (cvId: number) => {
    try {
      const sessionToken = localStorage.getItem('sessionToken') || '';
      const response = await cvApiRequest.getCvById(cvId, sessionToken);
      if (response.payload.data && response.payload.data.filePath) {
        try {
          const cloudinaryData = JSON.parse(response.payload.data.filePath);
          if (cloudinaryData.secure_url) {
            // Sử dụng Google Docs Viewer để xem PDF trực tiếp
            const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cloudinaryData.secure_url)}&embedded=true`;
            window.open(viewerUrl, '_blank');
          } else {
            Alert.error('CV_NOT_FOUND');
          }
        } catch (parseError) {
          // Nếu filePath không phải JSON, có thể là URL trực tiếp
          const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(response.payload.data.filePath)}&embedded=true`;
          window.open(viewerUrl, '_blank');
        }
      } else {
        Alert.error('CV_NOT_FOUND');
      }
    } catch (error) {
      Alert.error('CV_LOAD_ERROR');
    }
  };

  const handleSendEmail = (application: Apply) => {
    const cookies = document.cookie;
    const companyNameMatch = cookies.match(/companyName=([^;]+)/);
    const companyName = companyNameMatch ? decodeURIComponent(companyNameMatch[1]) : 'Công ty';
    
    const subject = `Phản hồi đơn ứng tuyển vị trí ${application.jobTitle}`;
    const body = `
Kính gửi ${application.candidateName},

Cảm ơn bạn đã quan tâm và gửi hồ sơ ứng tuyển vị trí ${application.jobTitle} tại ${companyName}.

Chúng tôi đã nhận được CV của bạn và sẽ xem xét kỹ lưỡng. Nếu hồ sơ của bạn phù hợp với vị trí này, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để trao đổi thêm.

Một lần nữa cảm ơn sự quan tâm của bạn đến cơ hội nghề nghiệp tại ${companyName}.

Trân trọng,
Phòng Nhân sự
${companyName}
    `.trim();

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(application.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  const getAvailableStatuses = (currentStatus: number) => {
    // Danh sách tất cả trạng thái có thể
    const allStatuses = [
      { value: -1, label: 'Từ chối', disabled: false },
      { value: 0, label: 'Chờ xét duyệt', disabled: false },
      { value: 1, label: 'Đang xem xét', disabled: false },
      { value: 2, label: 'Chờ phỏng vấn', disabled: false },
      { value: 3, label: 'Phỏng vấn xong', disabled: false },
      { value: 4, label: 'Chờ quyết định', disabled: false },
      { value: 5, label: 'Đã tuyển dụng', disabled: false }
    ];

    // Nếu đã kết thúc (từ chối hoặc tuyển dụng) thì chỉ hiển thị trạng thái hiện tại
    if (currentStatus === -1 || currentStatus === 5) {
      return [allStatuses.find(s => s.value === currentStatus)!];
    }

    // Chỉ hiển thị trạng thái hiện tại, trạng thái kế tiếp và trạng thái từ chối
    return allStatuses.filter(status => 
      status.value === currentStatus || // trạng thái hiện tại
      status.value === currentStatus + 1 || // trạng thái kế tiếp
      status.value === -1 // trạng thái từ chối luôn hiển thị
    );
  };

  const handleViewJob = async (jobId: number) => {
    try {
      const response = await jobApiRequest.getJobById(jobId);
      setSelectedJob(response.payload.data);
      setIsJobDetailModalOpen(true);
    } catch (error) {
      Alert.error('Không thể tải thông tin công việc');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg rounded-lg p-6 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quản lý đơn ứng tuyển</h1>
            <p className="mt-2 text-blue-100">Theo dõi và xử lý các đơn ứng tuyển từ ứng viên</p>
          </div>
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FaSync className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ứng viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày ứng tuyển
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applyList?.map((application) => (
                  <tr key={application.applyId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <FaUserCircle className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.candidateName || 'Ứng viên #' + application.applyId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(application.date).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.jobTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <select
                          value={application.status}
                          onChange={(e) => handleStatusChange(application.applyId, Number(e.target.value))}
                          className={`appearance-none w-full pl-10 pr-8 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out
                            ${getStatusColor(application.status)} 
                            ${application.status === -1 || application.status === 5 
                              ? 'opacity-80 cursor-not-allowed' 
                              : 'cursor-pointer focus:ring-2 focus:ring-offset-2'}`}
                          disabled={application.status === -1 || application.status === 5}
                        >
                          {getAvailableStatuses(application.status).map((status) => (
                            <option 
                              key={status.value} 
                              value={status.value}
                              className="text-gray-900 bg-white"
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          {getStatusIcon(application.status)}
                        </div>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <FaChevronDown className={`w-4 h-4 ${application.status === -1 || application.status === 5 ? 'text-gray-400' : 'text-gray-700'}`} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(application)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FaEye className="mr-2" />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Header với gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Chi tiết đơn ứng tuyển</h3>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột trái - Thông tin ứng viên và các thông tin khác */}
                <div className="space-y-8">
                  {/* Card thông tin ứng viên */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <FaUserCircle className="w-5 h-5 mr-2 text-blue-500" />
                      Thông tin ứng viên
                    </h4>
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                          <span className="text-2xl font-bold">
                            {selectedApplication.candidateName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-xl font-semibold text-gray-900">{selectedApplication.candidateName}</div>
                          <div className="text-gray-500 flex items-center mt-1">
                            <FaEnvelope className="w-4 h-4 mr-2" />
                            {selectedApplication.email}
                          </div>
                          <div className="text-gray-500 flex items-center mt-1">
                            <FaCalendarAlt className="w-4 h-4 mr-2" />
                            {new Date(selectedApplication.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  

                  {/* Card CV */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <FaFileAlt className="w-5 h-5 mr-2 text-blue-500" />
                      CV đính kèm
                    </h4>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <FaFileAlt className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">CV_{selectedApplication.candidateName}.pdf</p>
                          <p className="text-xs text-gray-500 mt-1">PDF Document</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewCV(selectedApplication.candidateCvId)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                      >
                        Xem hồ sơ
                      </button>
                    </div>
                  </div>

                  {/* Card liên hệ */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <FaEnvelope className="w-5 h-5 mr-2 text-blue-500" />
                      Liên hệ ứng viên
                    </h4>
                    <button
                      onClick={() => handleSendEmail(selectedApplication)}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
                    >
                      <FaEnvelope className="w-5 h-5 mr-2" />
                      Gửi email cho ứng viên
                    </button>
                  </div>
                </div>

                {/* Cột phải - Card trạng thái ứng tuyển */}
                <div className="space-y-8">
                  {/* Card thông tin công việc */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <FaFileAlt className="w-5 h-5 mr-2 text-blue-500" />
                      Thông tin công việc
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Vị trí ứng tuyển</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{selectedApplication.jobTitle}</p>
                        </div>
                        <button 
                          onClick={() => handleViewJob(selectedApplication.jobId)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                        >
                          Xem công việc
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card trạng thái ứng tuyển */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <FaCheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                      Trạng thái ứng tuyển
                    </h4>
                    <div className="space-y-6">
                      <StatusProgressBar currentStatus={selectedApplication.status} statusHistory={selectedApplication.statusHistory} />
                      <div className="relative mt-4">
                        <select
                          value={selectedApplication.status}
                          onChange={(e) => handleStatusChange(selectedApplication.applyId, Number(e.target.value))}
                          className={`appearance-none w-full pl-12 pr-10 py-3 rounded-xl text-sm font-medium shadow-sm border border-gray-200
                            ${getStatusColor(selectedApplication.status)} 
                            ${selectedApplication.status === -1 || selectedApplication.status === 5 
                              ? 'opacity-80 cursor-not-allowed' 
                              : 'cursor-pointer hover:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'}`}
                          disabled={selectedApplication.status === -1 || selectedApplication.status === 5}
                        >
                          {getAvailableStatuses(selectedApplication.status).map((status) => (
                            <option 
                              key={status.value} 
                              value={status.value}
                              className="text-gray-900 bg-white py-2"
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          {getStatusIcon(selectedApplication.status)}
                        </div>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <FaChevronDown className={`w-4 h-4 ${selectedApplication.status === -1 || selectedApplication.status === 5 ? 'text-gray-400' : 'text-gray-700'}`} />
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="mt-6 space-y-4">
                        {selectedApplication.statusHistory?.map((history: StatusHistory, index: number) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getStatusColor(history.status)} flex items-center justify-center shadow-sm`}>
                              {getStatusIcon(history.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {getStatusLabel(history.status)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(history.date).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {isJobDetailModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Chi tiết công việc</h3>
              <button
                onClick={() => setIsJobDetailModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Job Header Card */}
              <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
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
                      <span>Hết hạn: {selectedJob.expirationDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-4">
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
        </div>
      )}
    </div>
  );
}
