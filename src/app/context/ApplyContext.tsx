"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import applyApiRequest from "@/app/apiRequest/apply";

export interface Apply {
  applyId: number;
  status: number;
  candidateCvId: number;
  jobId: number;
  coverLetter: string;
  date: string;
  [key: string]: any;
}

type ApplyContextType = {
  appliesListByEmployerId: Apply[] | null;
  setAppliesListByEmployerId: React.Dispatch<React.SetStateAction<Apply[] | null>>;
};

const defaultContext: ApplyContextType = {
  appliesListByEmployerId: null,
  setAppliesListByEmployerId: () => null,
};

const ApplyContext = createContext<ApplyContextType>(defaultContext);

export const ApplyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appliesListByEmployerId, setAppliesListByEmployerId] = useState<Apply[] | null>(null);

  useEffect(() => {
    const fetchAppliesByEmployer = async () => {
      const cookies = document.cookie;
      const employerIdMatch = cookies.match(/userId=([^;]+)/);
      const employerId = employerIdMatch ? parseInt(employerIdMatch[1], 10) : null;

      if (employerId !== null) {
        try {
          const appliesResult = await applyApiRequest.getAppliesByEmployerId(employerId);

          if (Array.isArray(appliesResult.payload.data)) {
            setAppliesListByEmployerId(appliesResult.payload.data);
          } else if (appliesResult.payload.data) {
            setAppliesListByEmployerId([appliesResult.payload.data]);
          } else {
            setAppliesListByEmployerId([]);
          }
        } catch (error) {
          console.error("Error fetching applies by employer:", error);
          setAppliesListByEmployerId([]);
        }
      }
    };

    fetchAppliesByEmployer();
  }, []);

  return (
    <ApplyContext.Provider value={{ appliesListByEmployerId, setAppliesListByEmployerId }}>
      {children}
    </ApplyContext.Provider>
  );
};

export const useApplyContext = () => useContext(ApplyContext);
