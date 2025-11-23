import { GradeDetailRow, MonHoc } from "@/interfaces/sinhvien/grades";

export function formatGradeDetailRow(gradeDetailRow: GradeDetailRow[] | undefined): string {
	if (!gradeDetailRow) return '';

	return gradeDetailRow.filter((row) => row.level3 && row.value !== null)
		.map((row) => {
			const level1 = row.level1?.replace(/\n/g, ' ').trim();
			const level2 = row.level2?.replace(/\n/g, ' ').trim();
			const level3 = row.level3?.replace(/\n/g, ' ').trim();
			let label = `${level1 ? `${level1 + ' '}` : ''}${level2 ? `${level2 + ' '}` : ''}${level3 ? `${level3 + ' '}` : ''}`
			const value = row.isCheck ? (row.value === '1' ? '✅' : '❌') : row.value;
			return `<b>${label}:</b> <code>${value}</code>`;
		})
		.join('\n');
}

export function formatGradeDetail(gradeDetail: MonHoc[]): string {
	return gradeDetail
		.map((ct) => `<b>${ct.tenMonHoc}</b> (${ct.soTinChi} TC): <code>${ct.diemTrungBinh}</code>`)
		.join('\n');
}