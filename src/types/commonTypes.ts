export type SelectedGarden = {
  dayKey: string;
  publicId: string;
  summary?: string | null;
  shareUrl?: string | null; 
};

export type Garden = {
  periodKey: string;
  publicId: string;
  summary?: string | null;
  shareUrl?: string | null;
  status: | "PENDING" | "READY" | "FAILED";
};
