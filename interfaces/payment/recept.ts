import { SchoolApiResponse } from "@/common"

export interface OnlineReceptInfoResponse extends SchoolApiResponse<OnlineReceptInfo> { }
export interface OnlineReceptDetailResponse extends SchoolApiResponse<OnlineReceptDetail[]> { }

export interface OnlineReceptResponse extends SchoolApiResponse<OnlineRecept[]> { }

export interface OnlineRecept {
    transID: string,
    idSoThuTrucTuyen: number,
    soPhieu: number | null,
    noiDungThu: string,
    tongTien: number,
    ngayThanhToan: string,
    isDaThanhToan: boolean,
    isDaCapNhatSoThu: boolean,
    trangThaiGD: string,
    urlInvoice: string | null,
    isHuy: boolean,
    isHienThiNutHuyThanhToan: boolean,
    metaData: any | null
}

export interface OnlineReceptInfo {
    transID: string,
    urlKetQua: string,
    tongTien: number,
    daThanhToan: boolean,
    ngayThanhToan: string | null
}

export interface OnlineReceptDetail {
    ma: string,
    noiDungThu: string,
    nienHoc: string,
    soTienNop: number
}
