import { Document, Model } from "mongoose";

interface MonthData {
  month: string;
  count: number;
}

export async function generateLast12MonthData<T extends Document>(
  model: Model<T>
): Promise<{ last12Month: MonthData[] }> {
  const last12Month: MonthData[] = [];

  const curentDate = new Date();
  curentDate.setDate(curentDate.getDate() + 1);

  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      curentDate.getFullYear(),
      curentDate.getMonth(),
      curentDate.getDate() - i * 28
    );
    const startDate = new Date(
      curentDate.getFullYear(),
      curentDate.getMonth(),
      curentDate.getDate() - 28
    );

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
