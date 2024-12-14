import React, { createContext, useContext, useState } from "react";
import { JobType } from "@/app/schemaValidations/save.schema";

type SavedJobsContextType = {
  savedJobs: JobType[] | null;
  setSavedJobs: React.Dispatch<React.SetStateAction<JobType[] | null>>;
};

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

export const SavedJobsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState<JobType[] | null>(null);

  return (
    <SavedJobsContext.Provider value={{ savedJobs, setSavedJobs }}>
      {children}
    </SavedJobsContext.Provider>
  );
};

export const useSavedJobsContext = () => {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error("useSavedJobsContext must be used within a SavedJobsProvider");
  }
  return context;
}; 