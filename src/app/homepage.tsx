import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"; // Import heart icons
import { useJobContext } from "@/app/context/JobContext";
import { Job } from "@/app/schemaValidations/job.schema";

export default function HomePage() {
  const { jobListContext } = useJobContext();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]); // State for saved jobs

  useEffect(() => {
    if (jobListContext) {
      setFilteredJobs(jobListContext);
    }
  }, [jobListContext]);

  // Function to toggle saved job
  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  return (
    <div>
      {filteredJobs.map((job) => (
        <div key={job.jobId} className="job-item">
          <h3>{job.title}</h3>
          <button onClick={() => toggleSaveJob(job.jobId)}>
            {savedJobs.includes(job.jobId) ? (
              <AiFillHeart className="text-red-500" />
            ) : (
              <AiOutlineHeart className="text-gray-500" />
            )}
          </button>
          {/* Other job details */}
        </div>
      ))}
    </div>
  );
}