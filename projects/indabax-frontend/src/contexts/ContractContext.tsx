import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Contract {
  id: number;
  baselineRate: string;
  targetRate: string;
  notionalAmount: string;
  durationDays: string;
  premium: number;
  status: string;
  createdAt: string;
  color: string; // Color for visualization
}

interface ContractContextType {
  contracts: Contract[];
  addContract: (contract: Omit<Contract, 'id' | 'color'>) => void;
  updateContract: (id: number, updates: Partial<Contract>) => void;
  removeContract: (id: number) => void;
  getContractsByBaselineRate: (baselineRate: string) => Contract[];
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

// Color palette for different baseline rates
const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

// Generate a consistent color for a baseline rate
const getColorForBaselineRate = (baselineRate: string, existingContracts: Contract[]): string => {
  // Check if we already have a color for this baseline rate
  const existingContract = existingContracts.find(c => c.baselineRate === baselineRate);
  if (existingContract) {
    return existingContract.color;
  }

  // Find the next available color
  const usedColors = existingContracts.map(c => c.color);
  const availableColor = COLOR_PALETTE.find(color => !usedColors.includes(color));

  // If all colors are used, cycle through them
  return availableColor || COLOR_PALETTE[existingContracts.length % COLOR_PALETTE.length];
};

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);

  const addContract = (contractData: Omit<Contract, 'id' | 'color'>) => {
    const newContract: Contract = {
      ...contractData,
      id: Date.now(),
      color: getColorForBaselineRate(contractData.baselineRate, contracts),
    };

    setContracts(prev => [...prev, newContract]);
  };

  const updateContract = (id: number, updates: Partial<Contract>) => {
    setContracts(prev =>
      prev.map(contract =>
        contract.id === id ? { ...contract, ...updates } : contract
      )
    );
  };

  const removeContract = (id: number) => {
    setContracts(prev => prev.filter(contract => contract.id !== id));
  };

  const getContractsByBaselineRate = (baselineRate: string) => {
    return contracts.filter(contract => contract.baselineRate === baselineRate);
  };

  const value: ContractContextType = {
    contracts,
    addContract,
    updateContract,
    removeContract,
    getContractsByBaselineRate,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = (): ContractContextType => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
};
