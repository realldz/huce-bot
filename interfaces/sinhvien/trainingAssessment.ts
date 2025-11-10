import { SchoolApiResponse } from "@/interfaces/common";

export interface TrainingAssessmentResponse extends SchoolApiResponse<TrainingAssessment[]> { }

export interface TrainingAssessment {
    idDot: number,
    tenDot: string,
    namHoc: number,
    soThuTu: number,
    khenThuongs: Array<any>,
    kyLuats: Array<any>,
    diemRenLuyens: TrainingPoint[],
}

export interface TrainingPoint {
    soDiem: number,
    xepLoai: string
}