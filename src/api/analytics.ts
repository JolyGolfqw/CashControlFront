export type AnalyticsPoint = {
    date: string;
    total: number;
    count: number;
  };
  
  export async function fetchAnalytics(params: {
    period: "day" | "week" | "month";
    start: string;
    end: string;
  }): Promise<AnalyticsPoint[]> {
    const res = await fetch(
      `/api/analytics?period=${params.period}&start=${params.start}&end=${params.end}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
  
    if (!res.ok) {
      throw new Error("Failed to load analytics");
    }
  
    return res.json();
  }
  