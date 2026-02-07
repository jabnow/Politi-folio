export interface GeopoliticalEvent {
  id: number | string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  country: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  affectedTransactions?: number;
  source?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  location: {
    lat: number;
    lng: number;
  };
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  timestamp: string;
}

export interface CountryRisk {
  country: string;
  code: string;
  riskScore: number;
  location: {
    lat: number;
    lng: number;
  };
  riskFactors: {
    political: number;
    economic: number;
    regulatory: number;
  };
}

