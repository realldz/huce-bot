export interface GradeDetailResponse {
    result: {
        rows: GradeDetailRow[];
    };
}

export interface GradeDetailRow {
    level1: string | null;
    level2: string | null;
    level3: string;
    value: string;
    isCheck: boolean;
}