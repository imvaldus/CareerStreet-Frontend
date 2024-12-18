/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { useCookies } from "react-cookie";

import Alert from "@/components/Alert";
import {
  JobCreateBodyType,
  LevelListResType,
} from "@/app/schemaValidations/job.schema";
import jobApiRequest from "@/app/apiRequest/job";
import { TechListResType } from "@/app/schemaValidations/tech.schema";
import techApiRequest from "@/app/apiRequest/tech";
import { TechDetailCreateBodyType } from "@/app/schemaValidations/techDetail.schema";
import { getCompanyColor } from "@/components/HomePage";
import { useCookies } from "react-cookie";
import { MessageUtils } from "@/utils/messageUtils";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaGlobe } from "react-icons/fa";

interface JobFormData {
  companyName: string;
  numberOfEmployees: string;
  companyWebsite: string;
  companyOverview: string;
  title: string;
  jobLocation: string;
  salary: string;
  numberOfRecruitment: number;
  jobDescription: string;
  jobRequirements: string;
  benefits: string;
  educationLevel: string;
  jobRank: string;
  jobType: string;
  gender: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  postingDate: string;
  expirationDate: string;
  views: number;
  status: number;
  employerId: number;
  techIds: number[]; // Đảm bảo techIds là một mảng số
  levelId: number;
}

export default function AddJobPage({
  levelList,
  techList,
}: {
  levelList: LevelListResType["data"] | null;
  techList: TechListResType["data"] | null;
}) {
  const [formData, setFormData] = useState<JobFormData>({
    companyName: "",
    numberOfEmployees: "0",
    companyWebsite: "",
    companyOverview: "",
    title: "",
    jobLocation: "",
    salary: "",
    numberOfRecruitment: 0,
    jobDescription: "",
    jobRequirements: "",
    benefits: "",
    educationLevel: "",
    jobRank: "",
    jobType: "",
    gender: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    postingDate: "",
    expirationDate: "",
    levelId: 0,
    techIds: [], // Khởi tạo như một mảng số
    status: 0,
    views: 0,
    employerId: 0,
  });

  const [cookies] = useCookies(["userId"]); // Nhận cookie

  // Sử dụng useEffect để lấy userId từ cookie khi component được render
  useEffect(() => {
    const userId = cookies.userId; // Lấy giá trị userId từ cookie
    if (userId) {
      setFormData((prevData) => ({
        ...prevData,
        employerId: userId, // Gán giá trị userId cho employerId
      }));
    }
  }, [cookies]); // Chạy một lần khi component được mount

  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng của dropdown
  const [selectedTech, setSelectedTech] = useState(new Set(formData.techIds)); // Lưu trữ công nghệ đã chọn

  // Hàm xóa công nghệ
  const removeTech = (id: number) => {
    setFormData((prevData) => ({
      ...prevData,
      techIds: prevData.techIds.filter((techId) => techId !== id), // Lọc ra công nghệ không phải là id cần xóa
    }));

    // Cập nhật selectedTech khi xóa công nghệ
    setSelectedTech((prev) => {
      const updatedTech = new Set(prev);
      updatedTech.delete(id); // Xóa id khỏi selectedTech
      return updatedTech; // Trả về Set đã cập nhật
    });
  };

  // Hàm xử lý bật/tắt dropdown
  const handleToggleDropdown = () => {
    console.log("Toggled Dropdown"); // Kiểm tra xem hàm này có được gọi không
    setIsOpen((prev) => !prev); // Chuyển trạng thái dropdown
  };

  // Hàm chọn công nghệ
  const handleSelectTech = (id: number) => {
    const updatedTech = new Set(selectedTech);
    if (updatedTech.has(id)) {
      updatedTech.delete(id);
    } else {
      // Kiểm tra số lượng công nghệ đã chọn
      if (updatedTech.size >= 10) {
        Alert.error("ERROR_TOO_MANY_TECH");
        return;
      }
      updatedTech.add(id);
    }

    setSelectedTech(updatedTech);
    setFormData(prev => ({
      ...prev,
      techIds: Array.from(updatedTech)
    }));
  };

  const techIdsArray = Array.from(selectedTech); // Lấy danh sách techIds từ selectedTech

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [x, setX] = useState(0); // Biến để lưu số ngày chênh lệch
  // Lấy ngày hiện tại và đặt vào formData khi component được mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Lấy ngày hôm nay ở định dạng YYYY-MM-DD
    setFormData((prevData) => ({
      ...prevData,
      postingDate: today,
    }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    // Cập nhật formData
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Xóa lỗi khi người dùng sửa
    setErrors(prev => {
      const newErrors = { ...prev };

      // Validate realtime cho từng trường
      switch (id) {
        case 'companyWebsite':
          if (value) {
            const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            if (urlPattern.test(value)) {
              delete newErrors.companyWebsite;
            }
          }
          break;

        case 'numberOfEmployees':
          const numEmployees = Number(value);
          if (value && numEmployees > 0 && numEmployees <= 1000000 && Number.isInteger(numEmployees)) {
            delete newErrors.numberOfEmployees;
          }
          break;

        case 'title':
          if (value && value.length >= 10 && value.length <= 100) {
            delete newErrors.title;
          }
          break;

        case 'salary':
          if (salaryType === 'fixed') {
            const salaryNum = Number(value);
            if (value && salaryNum >= 1000000 && salaryNum <= 100000000) {
              delete newErrors.salary;
            }
          } else {
            delete newErrors.salary;
          }
          break;

        case 'jobDescription':
          if (value && value.length >= 10) {
            delete newErrors.jobDescription;
          }
          break;

        case 'jobRequirements':
          if (value && value.length >= 10) {
            delete newErrors.jobRequirements;
          }
          break;

        case 'benefits':
          if (value && value.length >= 10) {
            delete newErrors.benefits;
          }
          break;

        case 'levelId':
          if (value) {
            delete newErrors.levelId;
          }
          break;

        case 'educationLevel':
          if (value) {
            delete newErrors.educationLevel;
          }
          break;

        case 'jobType':
          if (value) {
            delete newErrors.jobType;
          }
          break;

        case 'gender':
          if (value) {
            delete newErrors.gender;
          }
          break;

        case 'contactPerson':
          if (value) {
            delete newErrors.contactPerson;
          }
          break;

        case 'contactPhone':
          if (value && /^[0-9]{10,11}$/.test(value)) {
            delete newErrors.contactPhone;
          }
          break;

        case 'contactEmail':
          if (value && value.includes('@')) {
            delete newErrors.contactEmail;
          }
          break;

        case 'contactAddress':
          if (value) {
            delete newErrors.contactAddress;
          }
          break;

        case 'jobRank':
          if (value) {
            delete newErrors.jobRank;
          }
          break;

        default:
          if (value) {
            delete newErrors[id];
          }
          break;
      }

      return newErrors;
    });

    // Xử lý các logic khác của handleChange (như xử lý ngày tháng)
    const today = new Date().toISOString().split("T")[0];
    // ... phần code xử lý ngày tháng giữ nguyên
  };

  const validateForm = () => {
    const {
      companyName,
      numberOfEmployees,
      companyWebsite,
      companyOverview,
      jobLocation,
      title,
      salary,
      jobDescription,
      jobRequirements,
      benefits,
      educationLevel,
      jobRank,
      jobType,
      contactPerson,
      contactPhone,
      contactEmail,
      contactAddress,
      postingDate,
      expirationDate,
    } = formData; // formData là object chứa các giá trị của form.

    const formErrors: { [key: string]: string } = {};

    // Kiểm tra từng trường

    // Kiểm tra các trường liên quan đến thông tin công ty và công việc
    if (!companyName)
      formErrors.companyName = MessageUtils.getMessage("ERROR_REQUIRED_COMPANY_NAME");
    if (!numberOfEmployees)
      formErrors.numberOfEmployees = MessageUtils.getMessage("ERROR_REQUIRED_EMPLOYEES");
    if (!companyWebsite)
      formErrors.companyWebsite = MessageUtils.getMessage("ERROR_REQUIRED_WEBSITE");
    if (!salary) 
      formErrors.salary = MessageUtils.getMessage("ERROR_REQUIRED_SALARY");
    if (!jobType) 
      formErrors.jobType = MessageUtils.getMessage("ERROR_REQUIRED_JOB_TYPE");
    if (!contactPerson)
      formErrors.contactPerson = MessageUtils.getMessage("ERROR_REQUIRED_CONTACT_PERSON");
    if (!contactAddress)
      formErrors.contactAddress = MessageUtils.getMessage("ERROR_REQUIRED_CONTACT_ADDRESS");
    if (!postingDate)
      formErrors.postingDate = MessageUtils.getMessage("ERROR_REQUIRED_POSTING_DATE");
    if (!expirationDate)
      formErrors.expirationDate = MessageUtils.getMessage("ERROR_REQUIRED_EXPIRATION_DATE");
    if (!companyOverview)
      formErrors.companyOverview = MessageUtils.getMessage("ERROR_REQUIRED_COMPANY_OVERVIEW");
    if (!jobLocation)
      formErrors.jobLocation = MessageUtils.getMessage("ERROR_REQUIRED_JOB_LOCATION");
    if (!jobDescription)
      formErrors.jobDescription = MessageUtils.getMessage("ERROR_REQUIRED_JOB_DESCRIPTION");
    if (!jobRequirements)
      formErrors.jobRequirements = MessageUtils.getMessage("ERROR_REQUIRED_JOB_REQUIREMENTS");
    if (!benefits) 
      formErrors.benefits = MessageUtils.getMessage("ERROR_REQUIRED_BENEFITS");
    if (!educationLevel)
      formErrors.educationLevel = MessageUtils.getMessage("ERROR_REQUIRED_EDUCATION");
    if (!jobRank) 
      formErrors.jobRank = MessageUtils.getMessage("ERROR_REQUIRED_JOB_RANK");
    if (!title) 
      formErrors.title = MessageUtils.getMessage("ERROR_REQUIRED_JOB_TITLE");

    // Thêm validation cho mức lương
    if (Number(salary) < 1000)
      formErrors.salary = MessageUtils.getMessage("ERROR_SALARY_TOO_LOW");
    if (Number(salary) > 100000000)
      formErrors.salary = MessageUtils.getMessage("ERROR_SALARY_TOO_HIGH");

    // Kiểm tra tiêu đề
    const bannedTitleWords = ['urgent', 'gấp', 'hot', 'khẩn', 'nhanh', 'siêu'];
    const titleLower = title.toLowerCase();
    for (const word of bannedTitleWords) {
      if (titleLower.includes(word)) {
        formErrors.title = MessageUtils.getMessage("ERROR_TITLE_BANNED_WORD").replace("{word}", word);
        break;
      }
    }
    if (title.length < 10)
      formErrors.title = MessageUtils.getMessage("ERROR_TITLE_TOO_SHORT");
    if (title.length > 100)
      formErrors.title = MessageUtils.getMessage("ERROR_TITLE_TOO_LONG");

    // Kiểm tra độ dài mô tả
    if (jobDescription.length < 10)
      formErrors.jobDescription = MessageUtils.getMessage("ERROR_JOB_DESCRIPTION_TOO_SHORT");
    if (jobRequirements.length < 10)
      formErrors.jobRequirements = MessageUtils.getMessage("ERROR_JOB_REQUIREMENTS_TOO_SHORT");
    if (benefits.length < 10)
      formErrors.benefits = MessageUtils.getMessage("ERROR_BENEFITS_TOO_SHORT");

    // Kiểm tra email và số điện thoại
    if (!contactEmail.includes('@'))
      formErrors.contactEmail = MessageUtils.getMessage("ERROR_INVALID_EMAIL");
    if (!/^[0-9]{10,11}$/.test(contactPhone))
      formErrors.contactPhone = MessageUtils.getMessage("ERROR_INVALID_PHONE");

    // Kiểm tra địa điểm
    if (jobLocation.length < 5)
      formErrors.jobLocation = MessageUtils.getMessage("ERROR_JOB_LOCATION_INVALID");

    // Kiểm tra ngày đăng và hết hạn
    const postingDateObj = new Date(postingDate);
    const expirationDateObj = new Date(expirationDate);
    const now = new Date();

    if (postingDateObj > now)
      formErrors.postingDate = MessageUtils.getMessage("ERROR_POSTING_DATE_FUTURE");
    if (expirationDateObj <= postingDateObj)
      formErrors.expirationDate = MessageUtils.getMessage("ERROR_INVALID_DATE").replace("{field}", "hết hạn");

    // Kiểm tra giới tính
    const genderLower = formData.gender.toLowerCase();
    if (!['nam', 'nữ', 'không yêu cầu', 'nam/nữ', 'nam/nu'].includes(genderLower))
      formErrors.gender = MessageUtils.getMessage("ERROR_GENDER_INVALID");

    // Kiểm tra số lượng tuyển dụng
    if (formData.numberOfRecruitment < 0)
      formErrors.numberOfRecruitment = MessageUtils.getMessage("ERROR_INVALID_RECRUITMENT");
    if (formData.numberOfRecruitment > 100)
      formErrors.numberOfRecruitment = MessageUtils.getMessage("ERROR_RECRUITMENT_TOO_HIGH");

    // Validation cho số lượng nhân viên
    const numEmployees = Number(formData.numberOfEmployees);
    if (!formData.numberOfEmployees) {
      formErrors.numberOfEmployees = MessageUtils.getMessage("ERROR_REQUIRED_EMPLOYEES");
    } else if (numEmployees < 1) {
      formErrors.numberOfEmployees = MessageUtils.getMessage("ERROR_EMPLOYEES_TOO_LOW");
    } else if (numEmployees > 1000000) {
      formErrors.numberOfEmployees = MessageUtils.getMessage("ERROR_EMPLOYEES_TOO_HIGH");
    } else if (!Number.isInteger(numEmployees)) {
      formErrors.numberOfEmployees = MessageUtils.getMessage("ERROR_EMPLOYEES_MUST_BE_INTEGER");
    }

    // Validate website
    if (!formData.companyWebsite) {
      formErrors.companyWebsite = MessageUtils.getMessage("ERROR_REQUIRED_WEBSITE");
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.companyWebsite)) {
        formErrors.companyWebsite = MessageUtils.getMessage("ERROR_INVALID_WEBSITE");
      }
    }

    // Validate công nghệ yêu cầu
    if (formData.techIds.length === 0) {
      formErrors.techIds = MessageUtils.getMessage("ERROR_REQUIRED_TECH");
    } else if (formData.techIds.length > 10) {
      formErrors.techIds = MessageUtils.getMessage("ERROR_TOO_MANY_TECH");
    }

    // Validate kinh nghiệm
    if (!formData.levelId) {
      formErrors.levelId = MessageUtils.getMessage("ERROR_REQUIRED_LEVEL");
    }

    // Đặt lỗi vào state và trả về true nếu không có lỗi, false nếu có lỗi
    setErrors(formErrors);
    // Sau khi kiểm tra lỗi:
    // In ra lỗi nếu có
    console.log(JSON.stringify(formErrors, null, 2) + " validate"); // In ra nếu có lỗi trong form
    return Object.keys(formErrors).length === 0;
  };

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Mọi bài đăng mới đều có status = 0 (chờ duyệt)
        const jobData: JobCreateBodyType = {
          ...formData,
          salary: formData.salary.toString(),
          status: 0, // 0: chờ duyệt, 1: đã duyệt, -1: từ chối
          views: 0,
          levelName: "",
        };

        // Gửi yêu cầu tạo công việc và nhận phản hồi
        const jobResult = await jobApiRequest.createJob(jobData);
        console.log("Job creation result:", jobResult);

        // Lấy jobId từ kết quả trả về
        const jobId = jobResult.payload.data.jobId;

        // Tạo đối tượng dữ liệu cho TechDetail
        const techDetailData: TechDetailCreateBodyType = {
          jobId: jobId,
          techIds: techIdsArray,
        };

        console.log("Creating tech detail with data:", techDetailData);

        // Gửi yêu cầu tạo chi tiết công nghệ
        try {
          const techDetailResult = await techApiRequest.createTechDetail(techDetailData);
          console.log("Tech detail creation result:", techDetailResult);
          
          // Hiển thị thông báo phù hợp với status
          if (formData.status === 0) {
            Alert.success("SUCCESS_JOB_SCHEDULED", {
              date: formData.postingDate
            });
          } else {
            Alert.success("SUCCESS_JOB_CREATE");
          }
          
          router.push("/employer/jobs");
          router.refresh();
        } catch (error: any) {
          console.error("Error creating tech detail:", error);
          // Check if error has a message property
          const errorMessage = error?.payload?.message || "Có lỗi xảy ra khi tạo chi tiết công nghệ";
          Alert.error(errorMessage);
          
          // Try to delete the job since tech detail creation failed
          try {
            await jobApiRequest.updateJobStatus(jobId, 0); // Set job status to inactive
          } catch (deleteError) {
            console.error("Error cleaning up job after tech detail creation failed:", deleteError);
          }
        }
      } catch (error: any) {
        console.error("Error creating job:", error);
        const errorMessage = error?.payload?.message || "Có lỗi xảy ra khi tạo công việc";
        Alert.error(errorMessage);
      }
    }
  };

  // Thay đổi style cho các input, textarea và select
  const inputClasses = `
    w-full 
    rounded-lg 
    border-2 
    border-gray-300 
    focus:border-blue-500 
    focus:ring-2 
    focus:ring-blue-200 
    transition duration-200
    shadow-sm
    px-4 
    py-2.5
    text-gray-700
    bg-white
    hover:border-gray-400
  `;

  const textareaClasses = `
    w-full 
    rounded-lg 
    border-2 
    border-gray-300 
    focus:border-blue-500 
    focus:ring-2 
    focus:ring-blue-200 
    transition duration-200
    shadow-sm
    p-4 
    text-gray-700
    bg-white
    resize-none
    hover:border-gray-400
    min-h-[150px]
  `;

  const selectClasses = `
    w-full 
    rounded-lg 
    border-2 
    border-gray-300 
    focus:border-blue-500 
    focus:ring-2 
    focus:ring-blue-200 
    transition duration-200
    shadow-sm
    px-4 
    py-2.5
    text-gray-700
    bg-white
    hover:border-gray-400
    appearance-none
    cursor-pointer
  `;

  // Thêm state để quản lý loại lương
  const [salaryType, setSalaryType] = useState('fixed'); // 'fixed' hoặc 'negotiable'

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg mb-8 p-8">
          <h1 className="text-3xl font-bold text-white text-center">
            Đăng tin tuyển dụng
          </h1>
          <p className="text-blue-100 text-center mt-2">
            Tạo tin tuyển dụng để tìm kiếm ứng viên phù hợp
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information Card */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-100 hover:border-gray-200 transition duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 ml-3">
                    Thông tin công ty
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên công ty*
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      className={inputClasses}
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Nhập tên công ty"
                    />
                    {errors.companyName && (
                      <p className="mt-1.5 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  {/* Number of Employees */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng nhân viên*
                    </label>
                    <input
                      type="number"
                      id="numberOfEmployees"
                      className={inputClasses}
                      value={formData.numberOfEmployees}
                      onChange={handleChange}
                      min="0"
                    />
                    {errors.numberOfEmployees && (
                      <p className="mt-1.5 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                        {errors.numberOfEmployees}
                      </p>
                    )}
                  </div>

                  {/* Company Website */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Website công ty*
                    </label>
                    <input
                      type="text"
                      id="companyWebsite"
                      className={inputClasses}
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                    {errors.companyWebsite && (
                      <p className="mt-1.5 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                        {errors.companyWebsite}
                      </p>
                    )}
                  </div>

                  {/* Company Overview */}
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Giới thiệu công ty*
                    </label>
                    <div className="relative">
                      <textarea
                        id="companyOverview"
                        className={textareaClasses}
                        rows={6}
                        value={formData.companyOverview}
                        onChange={handleChange}
                        placeholder="• Mô tả về lĩnh vực hoạt động của công ty&#13;&#10;• Quy mô và thành tựu của công ty&#13;&#10;• Văn hóa và môi trường làm việc&#13;&#10; Định hướng phát triển"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {formData.companyOverview.length}/2000
                      </div>
                    </div>
                    {errors.companyOverview && (
                      <p className="text-sm text-red-600">{errors.companyOverview}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Details Card */}
              <div className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 ml-3">
                    Chi tiết công việc
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Chức danh*
                    </label>
                    <input
                      type="text"
                      id="title"
                      className={inputClasses}
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Vị trí tuyển dụng"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Number of Recruitment */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Số lượng cần tuyển*
                    </label>
                    <input
                      type="number"
                      id="numberOfRecruitment"
                      className={inputClasses}
                      value={formData.numberOfRecruitment}
                      onChange={handleChange}
                      min="0"
                    />
                    {errors.numberOfRecruitment && (
                      <p className="text-sm text-red-600">{errors.numberOfRecruitment}</p>
                    )}
                  </div>

                  {/* Job Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Địa điểm làm việc*
                    </label>
                    <input
                      type="text"
                      id="jobLocation"
                      className={inputClasses}
                      value={formData.jobLocation}
                      onChange={handleChange}
                      placeholder="Địa chỉ làm việc"
                    />
                    {errors.jobLocation && (
                      <p className="text-sm text-red-600">{errors.jobLocation}</p>
                    )}
                  </div>

                  {/* Job Rank */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cấp bậc*
                    </label>
                    <select
                      id="jobRank"
                      className={selectClasses}
                      value={formData.jobRank}
                      onChange={handleChange}
                    >
                      <option value="">Chọn cấp bậc</option>
                      <option value="Nhân viên">Nhân viên</option>
                      <option value="Quản lý">Quản lý</option>
                      <option value="Giám đốc">Giám đốc</option>
                      <option value="Trưởng phòng">Trưởng phòng</option>
                      <option value="Phó giám đốc">Phó giám đốc</option>
                      <option value="Giám đốc điều hành">Giám đốc điều hành</option>
                      <option value="Chuyên gia">Chuyên gia</option>
                      <option value="Tư vấn">Tư vấn</option>
                      <option value="Lãnh đạo">Lãnh đạo</option>
                      <option value="Giám sát">Giám sát</option>
                    </select>
                    {errors.jobRank && (
                      <p className="mt-1.5 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                        {errors.jobRank}
                      </p>
                    )}
                  </div>

                  {/* Salary */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mức lương (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary ? Number(formData.salary).toLocaleString('vi-VN') : ''}
                      onChange={(e) => {
                        // Chỉ giữ lại số từ chuỗi đã format
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({
                          ...prev,
                          salary: value
                        }));
                      }}
                      className={`w-full p-2 border rounded-md ${
                        errors.salary ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="1,000,000"
                    />
                    {errors.salary && (
                      <p className="text-red-500 text-sm mt-1">{errors.salary}</p>
                    )}            
                  </div>                 

                  {/* Job Description */}
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mô tả công việc*
                    </label>
                    <div className="relative">
                      <textarea
                        id="jobDescription"
                        className={textareaClasses}
                        rows={6}
                        value={formData.jobDescription}
                        onChange={handleChange}
                        placeholder="• Vai trò và trách nhiệm chính&#13;&#10;• Các công việc cụ thể cn thực hiện&#13;&#10;• Mục tiêu và kết quả mong đợi&#13;&#10;• Phạm vi công việc"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {formData.jobDescription.length}/2000
                      </div>
                    </div>
                    {errors.jobDescription && (
                      <p className="text-sm text-red-600">{errors.jobDescription}</p>
                    )}
                  </div>

                  {/* Job Requirements */}
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Yêu cầu công việc*
                    </label>
                    <div className="relative">
                      <textarea
                        id="jobRequirements"
                        className={textareaClasses}
                        rows={6}
                        value={formData.jobRequirements}
                        onChange={handleChange}
                        placeholder="• Kinh nghiệm và kỹ năng chuyên môn&#13;&#10;• Kỹ năng mềm cần thiết&#13;&#10;• Yêu cầu về ngôn ngữ&#13;&#10;• Các chứng chỉ hoặc bằng cấp (nếu có)"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {formData.jobRequirements.length}/2000
                      </div>
                    </div>
                    {errors.jobRequirements && (
                      <p className="text-sm text-red-600">{errors.jobRequirements}</p>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Quyền lợi*
                    </label>
                    <div className="relative">
                      <textarea
                        id="benefits"
                        className={textareaClasses}
                        rows={6}
                        value={formData.benefits}
                        onChange={handleChange}
                        placeholder="• Mức lương và các khoản thưởng&#13;&#10;• Chế độ bảo hiểm và phúc lợi&#13;&#10;• Cơ hội đào tạo và thăng tiến&#13;&#10;• Các chế độ nghỉ phép và du lịch"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {formData.benefits.length}/2000
                      </div>
                    </div>
                    {errors.benefits && (
                      <p className="text-sm text-red-600">{errors.benefits}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 ml-3">
                    Thông tin bổ sung
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Education Level */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Trình độ học vấn*
                    </label>
                    <select
                      id="educationLevel"
                      className={selectClasses}
                      value={formData.educationLevel}
                      onChange={handleChange}
                    >
                      <option value="">Chọn trình độ học vấn</option>
                      <option value="Trung học phổ thông">Trung học phổ thông</option>
                      <option value="Cao đẳng">Cao đẳng</option>
                      <option value="Đại học">Đại học</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Tiến sĩ">Tiến sĩ</option>
                    </select>
                    {errors.educationLevel && (
                      <p className="text-sm text-red-600">{errors.educationLevel}</p>
                    )}
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Kinh nghiệm*
                    </label>
                    <select
                      id="levelId"
                      className={selectClasses}
                      value={formData.levelId}
                      onChange={handleChange}
                    >
                      <option value="">Chọn mức kinh nghiệm</option>
                      {levelList?.map((level) => (
                        <option key={level.levelId} value={level.levelId}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                    {errors.levelId && (
                      <p className="text-sm text-red-600">{errors.levelId}</p>
                    )}
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Hình thức làm việc*
                    </label>
                    <select
                      id="jobType"
                      className={selectClasses}
                      value={formData.jobType}
                      onChange={handleChange}
                    >
                      <option value="">Chọn hình thức làm việc</option>
                      <option value="Toàn thời gian">Toàn thời gian</option>
                      <option value="Bán thời gian">Bán thời gian</option>
                      <option value="Thực tập">Thực tập</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Remote">Remote</option>
                    </select>
                    {errors.jobType && (
                      <p className="text-sm text-red-600">{errors.jobType}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Giới tính*
                    </label>
                    <select
                      id="gender"
                      className={selectClasses}
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Không yêu cầu">Không yêu cầu</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-red-600">{errors.gender}</p>
                    )}
                  </div>

                  {/* Tech Stack */}
                  <div className="col-span-2 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Công nghệ yêu cầu*
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={handleToggleDropdown}
                        className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 transition duration-200"
                      >
                        <span>Chọn công nghệ</span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpen && techList && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          <div className="max-h-60 overflow-y-auto">
                            {techList.map((tech) => (
                              <div
                                key={tech.techId}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                                  selectedTech.has(tech.techId) ? 'bg-blue-100' : ''
                                }`}
                                onClick={() => handleSelectTech(tech.techId)}
                              >
                                {tech.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Selected Tech Tags */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.techIds.map((id) => {
                          const tech = techList?.find((t) => t.techId === id);
                          return (
                            <span key={id} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
                              {tech?.name}
                              <button
                                type="button"
                                onClick={() => removeTech(id)}
                                className="ml-2 hover:text-red-600 transition duration-200"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {errors.techIds && (
                      <p className="text-sm text-red-600">{errors.techIds}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="bg-indigo-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 ml-3">
                    Thông tin liên hệ
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Person */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Người liên hệ*
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      className={inputClasses}
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Họ và tên"
                    />
                    {errors.contactPerson && (
                      <p className="text-sm text-red-600">{errors.contactPerson}</p>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại*
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      className={inputClasses}
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="Số điện thoại"
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-red-600">{errors.contactPhone}</p>
                    )}
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      className={inputClasses}
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-red-600">{errors.contactEmail}</p>
                    )}
                  </div>

                  {/* Contact Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Địa chỉ liên hệ*
                    </label>
                    <input
                      type="text"
                      id="contactAddress"
                      className={inputClasses}
                      value={formData.contactAddress}
                      onChange={handleChange}
                      placeholder="Địa chỉ"
                    />
                    {errors.contactAddress && (
                      <p className="text-sm text-red-600">{errors.contactAddress}</p>
                    )}
                  </div>

                  {/* Posting Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày đăng
                    </label>
                    <input
                      type="date"
                      id="postingDate"
                      className={inputClasses}
                      value={formData.postingDate}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  {/* Expiration Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày hết hạn*
                    </label>
                    <input
                      type="date"
                      id="expirationDate"
                      className={inputClasses}
                      value={formData.expirationDate}
                      onChange={handleChange}
                    />
                    {errors.expirationDate && (
                      <p className="text-sm text-red-600">{errors.expirationDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200 border-2 border-blue-700"
                >
                  Đăng tuyển
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            {/* Banner Image */}
            <div className="mb-4 w-full">
            <div className="flex items-center gap-4">
                <div className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${formData.companyName ? getCompanyColor(formData.companyName) : 'from-gray-500 to-gray-600'} flex items-center justify-center text-white font-bold text-2xl shadow-md`}>
                  {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3 truncate max-w-md">
                    {formData.companyName}
                  </h1>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span>{formData.contactAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaGlobe className="text-gray-400" />
                      <span>{formData.companyWebsite}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Title and Meta */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 truncate max-w-md">
                {formData.title || "Tiêu đề công việc"}
              </h1>

              <div className="flex flex-wrap gap-4 mb-4">
                <span className="flex items-center rounded-full bg-teal-100 px-4 py-2 text-sm text-teal-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {formData.jobType || "Hình thức làm việc"}
                </span>
                <span className="flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {formData.jobLocation || "Địa điểm"}
                </span>
                <span className="flex items-center rounded-full bg-green-100 px-4 py-2 text-sm text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                    {formData.salary ? `${Number(formData.salary).toLocaleString('vi-VN')} VNĐ` : "Mức lương"}
                </span>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Ngày đăng: <span className="font-medium">{formData.postingDate}</span> | 
                Hết hạn: <span className="font-medium">{formData.expirationDate}</span>
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Số lượng tuyển: <span className="font-medium">{formData.numberOfRecruitment} người</span></span>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Mô tả công việc</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                {formData.jobDescription.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>

            {/* Required Skills */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Kỹ năng yêu cầu</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                {formData.jobRequirements.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Trình độ học vấn:</span> {formData.educationLevel || "Không yêu cầu"}
                </p>
                
                {techIdsArray.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-600 mb-2">Công nghệ yêu cầu:</p>
                    <div className="flex flex-wrap gap-2">
                      {techIdsArray.map((techId) => {
                        const tech = techList?.find((t) => t.techId === techId);
                        return tech ? (
                          <span
                            key={tech.techId}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {tech.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <p className="text-gray-600">
                  <span className="font-medium">Kinh nghiệm:</span> {levelList?.find(level => level.levelId === formData.levelId)?.name || "Chưa chọn"}
                </p>
                
                <p className="text-gray-600">
                  <span className="font-medium">Cấp bậc:</span> {formData.jobRank || "Chưa chọn"}
                </p>
                
                <p className="text-gray-600">
                  <span className="font-medium">Giới tính:</span> {formData.gender || "Không yêu cầu"}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Quyền lợi</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                {formData.benefits.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Thông tin liên hệ</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Người liên hệ:</span> {formData.contactPerson || "Chưa cập nhật"}</p>
                <p><span className="font-medium">Email:</span> {formData.contactEmail || "Chưa cập nhật"}</p>
                <p><span className="font-medium">Số điện thoại:</span> {formData.contactPhone || "Chưa cập nhật"}</p>
                <p><span className="font-medium">Địa chỉ:</span> {formData.contactAddress || "Chưa cập nhật"}</p>
              </div>
            </div>

            {/* Company Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Thông tin công ty</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Công ty:</span> {formData.companyName || "Chưa cập nhật"}</p>
                <p><span className="font-medium">Website:</span> {formData.companyWebsite || "Chưa cập nhật"}</p>
                <p><span className="font-medium">Số lượng nhân viên:</span> {formData.numberOfEmployees || "Chưa cập nhật"}</p>
                <p><span className="font-medium">Hình thức làm việc:</span> {formData.jobType || "Chưa cập nhật"}</p>
                <p><span className="font-medium">Ngày hết hạn:</span> {formData.expirationDate || "Chưa cập nhật"}</p>
                {formData.companyOverview && (
                  <>
                    <p className="font-medium">Giới thiệu công ty:</p>
                    <p className="whitespace-pre-line">{formData.companyOverview}</p>
                  </>
                )}
              </div>
            </div>          
          </div>
        </div>
      </div>
    </div>
  );
}
