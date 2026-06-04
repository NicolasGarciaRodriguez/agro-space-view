export interface CreateAnalisisNdviDTO {
  parcelaId: string;
  explotacionId: string;
  dateFrom: string;
  dateTo: string;
  ndviMedio: number;
  cloudCover: number;
  usedImageId: string;
  usedImageDate: string;
  imageBase64: string;
  clima: {
    tempMaxAvg: number;
    tempMinAvg: number;
    totalPrecipitation: number;
    rainyDays: number;
  };
  timeSeries: Array<{
    date: string;
    mean: number;
    min: number;
    max: number;
  }>;
}

export interface AnalisisNdviDTO {
  _id: string;
  userId: string;
  explotacionId: string;
  parcelaId: string;
  dateFrom: string;
  dateTo: string;
  ndviMedio: number;
  cloudCover: number;
  usedImageId: string;
  usedImageDate: string;
  imageUrl: string;
  clima: {
    tempMaxAvg: number;
    tempMinAvg: number;
    totalPrecipitation: number;
    rainyDays: number;
  };
  timeSeries: Array<{
    date: string;
    mean: number;
    min: number;
    max: number;
  }>;
  createdAt: string;
}
