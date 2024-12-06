"use client";
import AppliesPage from "../_components/AppliesPage";
import { useApplyContext, Apply } from "@/app/context/ApplyContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import applyApiRequest from "@/app/apiRequest/apply";
import cvApiRequest from "@/app/apiRequest/cv";
import jobApiRequest from "@/app/apiRequest/job";

export default function Page() {
  const { appliesListByEmployerId, setAppliesListByEmployerId } = useApplyContext();
  const [filteredApplies, setFilteredApplies] = useState<Apply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const jobId = params.id;

  const loadApplicationDetails = async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      const sessionToken = localStorage.getItem('token') || '';
      
      // Fetch applies for specific job
      const applyResult = await applyApiRequest.getAppliesByJobId(parseInt(jobId as string));
      const applies = Array.isArray(applyResult.payload.data) 
        ? applyResult.payload.data 
        : [applyResult.payload.data];

      // Load details for each application
      const detailedApplies = await Promise.all(
        applies.map(async (apply: Apply) => {
          const [cvResponse, jobResponse] = await Promise.all([
            cvApiRequest.getCvById(apply.candidateCvId, sessionToken),
            jobApiRequest.getJobById(apply.jobId)
          ]);

          return {
            ...apply,
            candidateName: cvResponse.payload.data.fullName,
            email: cvResponse.payload.data.email,
            phone: cvResponse.payload.data.phone,
            jobTitle: jobResponse.payload.data.title
          };
        })
      );

      setFilteredApplies(detailedApplies);
      setAppliesListByEmployerId(prev => {
        const updated = [...(prev || [])];
        detailedApplies.forEach(detailed => {
          const index = updated.findIndex(a => a.applyId === detailed.applyId);
          if (index >= 0) {
            updated[index] = detailed;
          } else {
            updated.push(detailed);
          }
        });
        return updated;
      });
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplicationDetails();
  }, [jobId]);

  return (
    <AppliesPage 
      applyList={filteredApplies}
      isLoading={isLoading}
      onRefresh={loadApplicationDetails}
    />
  );
}
