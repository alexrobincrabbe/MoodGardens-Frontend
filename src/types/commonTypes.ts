export type SelectedGarden = {
  dayKey: string;
  publicId: string;
  summary?: string | null;
  shareUrl?: string | null; 
};

export type GardenPeriod = "DAY" | "WEEK" | "MONTH" | "YEAR";


export type Garden = {
    id:string;
    period: GardenPeriod
  periodKey: string;
  imageUrl: string;
  publicId: string;
  summary?: string | null;
  shareUrl?: string | null;
  status: | "PENDING" | "READY" | "FAILED";
};

export type LinkClasses = ({ isActive }: { isActive: boolean }) => string;
