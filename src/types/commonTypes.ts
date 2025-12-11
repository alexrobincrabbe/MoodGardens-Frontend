export type SelectedGarden = {
    dayKey: string;
    publicId: string;
    summary?: string | null;
    shareUrl?: string | null;
    version?: number | null;
};

export type GardenPeriod = "DAY" | "WEEK" | "MONTH" | "YEAR";


export type Garden = {
    id: string;
    period: GardenPeriod
    periodKey: string;
    updatedAt: string;
    imageUrl: string;
    publicId: string;
    shortTheme: string | null
    summary?: string | null;
    shareUrl?: string | null;
    status: | "PENDING" | "READY" | "FAILED";
};

export type LinkClasses = ({ isActive }: { isActive: boolean }) => string;
