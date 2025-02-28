// website/src/utils/storageUtils.ts

interface MelodyOwnershipData {
    name: string;
    notes: string[];
    salt: string;
    hash: string;
    timestamp: number; // Storing as timestamp for easier serialization
    owner: string;
    txHash?: string;
  }
  
  const STORAGE_KEY = 'melody-zkp-ownership-data';
  
  /**
   * Saves melody ownership data to localStorage
   */
  export const saveMelodyOwnership = (data: MelodyOwnershipData): void => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      // Get existing data
      const existingDataStr = localStorage.getItem(STORAGE_KEY);
      const existingData: MelodyOwnershipData[] = existingDataStr 
        ? JSON.parse(existingDataStr) 
        : [];
      
      // Add new data
      existingData.push(data);
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to save melody ownership data:', error);
    }
  };
  
  /**
   * Gets all stored melody ownership data
   */
  export const getAllMelodyOwnerships = (): MelodyOwnershipData[] => {
    if (typeof window === 'undefined') return []; // Return empty array on server-side
    
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      return dataStr ? JSON.parse(dataStr) : [];
    } catch (error) {
      console.error('Failed to retrieve melody ownership data:', error);
      return [];
    }
  };
  
  /**
   * Gets ownership data for a specific melody hash
   */
  export const getMelodyOwnershipByHash = (hash: string): MelodyOwnershipData | null => {
    try {
      const allData = getAllMelodyOwnerships();
      return allData.find(data => data.hash === hash) || null;
    } catch (error) {
      console.error('Failed to retrieve melody by hash:', error);
      return null;
    }
  };
  
  /**
   * Converts ownership data to a downloadable format
   */
  export const exportMelodyOwnershipData = (): void => {
    try {
      const allData = getAllMelodyOwnerships();
      if (allData.length === 0) {
        alert('No melody ownership data to export');
        return;
      }
      
      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'melody-ownership-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export melody ownership data:', error);
      alert('Failed to export data');
    }
  };
  
  export default {
    saveMelodyOwnership,
    getAllMelodyOwnerships,
    getMelodyOwnershipByHash,
    exportMelodyOwnershipData
  };