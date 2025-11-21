export interface ImageAsset {
  id: string;
  url: string;
  isBase64?: boolean; // To track if it needs conversion or is already data URL
}

export interface HistoryItem {
  id: string;
  personImage: string;
  clothImage: string;
  resultImage: string;
  timestamp: number;
}

export enum Step {
  SelectPerson = 1,
  SelectCloth = 2,
  GenerateResult = 3,
}

export interface StepProps {
  isActive: boolean;
  onNext: () => void;
  onBack?: () => void;
}