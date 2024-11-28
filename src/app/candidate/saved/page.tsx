// "use client"
import { cookies } from "next/headers";
import SaveJobsPage from "../_components/SaveJobsPage";
import ListSaveJobApiRequest from "@/app/apiRequest/save";
import { JobType } from "@/app/schemaValidations/save.schema";

export default async function SavePage() {
  const cookieTmp = cookies();
  const sessionToken = cookieTmp.get("sessionToken");
  // DÙNG ĐỂ LẤY MÃ CỦA TÀI KHOẢN KHI ĐĂNG NHẬP
  const userIdString = cookieTmp.get("userId");

  const userId = userIdString ? parseInt(userIdString.value, 10) : null;
  console.log('mã ứng viên', userId)
  let savedJobs: JobType[] | null = null;

  if (userId && sessionToken) {
    try {
      const response = await ListSaveJobApiRequest.getListSaveJobforCandidate(
        userId,
        sessionToken.value
      );
      savedJobs = response.payload.data;
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  }

  return (
    <>
      <SaveJobsPage savedJobs={savedJobs}
        candidateId={userId}
      />

    </>
  );
}