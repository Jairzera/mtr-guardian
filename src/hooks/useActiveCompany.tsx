import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useManagedCompanies, ManagedCompany } from "./useManagedCompanies";
import { useUserRole } from "./useUserRole";

interface ActiveCompanyContextType {
  activeCompany: ManagedCompany | null;
  setActiveCompany: (company: ManagedCompany) => void;
  companies: ManagedCompany[];
  isLoading: boolean;
}

const ActiveCompanyContext = createContext<ActiveCompanyContextType>({
  activeCompany: null,
  setActiveCompany: () => {},
  companies: [],
  isLoading: true,
});

export const ActiveCompanyProvider = ({ children }: { children: ReactNode }) => {
  const { role } = useUserRole();
  const { companies, isLoading } = useManagedCompanies();
  const [activeCompany, setActiveCompanyState] = useState<ManagedCompany | null>(null);

  useEffect(() => {
    if (role !== "consultant" || isLoading) return;
    
    const savedId = localStorage.getItem("active_company_id");
    const found = companies.find((c) => c.id === savedId && c.is_active);
    
    if (found) {
      setActiveCompanyState(found);
    } else if (companies.length > 0) {
      const first = companies.filter((c) => c.is_active)[0] || companies[0];
      setActiveCompanyState(first);
      localStorage.setItem("active_company_id", first.id);
    }
  }, [companies, isLoading, role]);

  const setActiveCompany = (company: ManagedCompany) => {
    setActiveCompanyState(company);
    localStorage.setItem("active_company_id", company.id);
  };

  return (
    <ActiveCompanyContext.Provider value={{ activeCompany, setActiveCompany, companies, isLoading }}>
      {children}
    </ActiveCompanyContext.Provider>
  );
};

export const useActiveCompany = () => useContext(ActiveCompanyContext);
