import { SchoolApiResponse } from "../common";

export interface SubmitPaymentReponse extends SchoolApiResponse<SubmitData> { }
export interface CancelPaymentResponse extends SchoolApiResponse<CancelPaymentData> { }

export interface SubmitData {
    urlInitPayment: string,
    qrCodeViewModel: QRCodeViewModel
}

export interface QRCodeViewModel {
    bank: string,
    virtualAcctName: string,
    virtualAcctId: string,
    qrImg: string,
    releaseTime: string | null,
    period: number,
    amount: number,
    fee: number,
    totalAmount: number,
    currency: string | null,
    description: string,
    partnerCode: symbol,
    createDate: number,
    hashCode: string,
    transID: string,
}

export interface CancelPaymentData {
    message: string
}