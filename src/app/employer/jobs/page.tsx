import { cookies } from "next/headers";

import JobsPage from "./_components/JobsPage";
import jobApiRequest from "@/app/apiRequest/job";
import { JobListResType } from "@/app/schemaValidations/job.schema";
import applyApiRequest from "@/app/apiRequest/apply";

export default async function EmployerJobsPage() {
  const cookieTmp = cookies();
  const sessionToken = cookieTmp.get("sessionToken");

  // type CvDataType = CvResType["data"];
  // let cv: CvDataType | null = null;

  type JobListDataType = JobListResType["data"];
  let jobList: JobListDataType | null = null; // Danh sách CV

  const username = cookieTmp.get("username");
  const userIdString = cookieTmp.get("userId");

  // Chuyển đổi userId từ chuỗi thành số nếu có giá trị
  const userId = userIdString ? parseInt(userIdString.value, 10) : null;

  if (username && sessionToken) {
    try {
      // Nếu có userId, lấy danh sách CV
      if (userId !== null) {
        const jobResult = await jobApiRequest.getAllJobById(
          userId,
          sessionToken.value
        );
        // Kiểm tra nếu `data` là một mảng
        if (Array.isArray(jobResult.payload.data)) {
          jobList = jobResult.payload.data; // Gán khi đúng là mảng
        } else {
          jobList = [jobResult.payload.data]; // Nếu là object, chuyển thành mảng
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Stack trace:", error.stack);
      } else {
        console.error("Unknown error:", error);
      }
    }
  }
  if (jobList) {
    jobList.forEach((job) => {
      console.log("Company Name: " + job.companyName);
    });
  }

  // Lấy số lượng đơn ứng tuyển cho mỗi công việc
  const applications = await Promise.all(
    jobList?.map(async (job) => {
      try {
        const response = await applyApiRequest.getApplicationCount(job.jobId);
        const count = response.payload.data || 0;
        console.log("Number of applications for job " + job.jobId + ": " + count);
        return { jobId: job.jobId, count };
      } catch (error) {
        console.error(`Error fetching applications for job ${job.jobId}:`, error);
        return { jobId: job.jobId, count: 0 };
      }
    }) ?? []
  );

  const numberOfApplications = applications.reduce((acc, curr) => {
    acc[curr.jobId] = curr.count;
    return acc;
  }, {} as { [key: number]: number });

  return (
    <>
      <JobsPage 
        jobList={jobList} 
        numberOfApplications={numberOfApplications}
      />
    </>
  );
}
