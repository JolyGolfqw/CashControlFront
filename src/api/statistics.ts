export type CategoryStat = {
    total: any;
    category_id: number;
    category_name: string;
    category_color: string;
    total_amount: number;
    percentage: number;
  };
  
  export type StatisticsResponse = {
    total_amount: number;
    by_category: CategoryStat[];
  };
  
  export async function fetchStatistics(period: "day" | "week" | "month" | "year") {
    const token = localStorage.getItem("token");
    const url = `/api/statistics?period=${period}`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to load statistics: ${errorText}`);
    }
  
    const data = await res.json();
    return data as StatisticsResponse;
  }
  