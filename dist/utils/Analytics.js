"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLast12MonthData = generateLast12MonthData;
async function generateLast12MonthData(model) {
    const last12Month = [];
    const curentDate = new Date();
    curentDate.setDate(curentDate.getDate() + 1);
    for (let i = 11; i >= 0; i--) {
        const endDate = new Date(curentDate.getFullYear(), curentDate.getMonth(), curentDate.getDate() - i * 28);
        const startDate = new Date(curentDate.getFullYear(), curentDate.getMonth(), curentDate.getDate() - 28);
        const monthYear = endDate.toLocaleString("default", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const count = await model.countDocuments({
            createdAt: {
                $gt: startDate,
                $lt: endDate,
            },
        });
        last12Month.push({ month: monthYear, count });
    }
    return { last12Month };
}
