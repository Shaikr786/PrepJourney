import { auth } from "@/lib/auth";
import {
  getWeeklyChartData,
  getMonthlyChartData,
  getCategoryBreakdown,
} from "@/lib/chart-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WeeklyHoursChart,
  MonthlyHoursChart,
  CategoryPieChart,
} from "@/components/charts/progress-charts";

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const [weekly, monthly, categories] = await Promise.all([
    getWeeklyChartData(userId),
    getMonthlyChartData(userId),
    getCategoryBreakdown(userId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Insights</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Weekly & monthly progress based on real study timestamps
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Hours (last 8 weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyHoursChart data={weekly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview (last 6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyHoursChart data={monthly} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Time by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
