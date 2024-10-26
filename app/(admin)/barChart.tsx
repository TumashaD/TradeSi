import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface ChartBar {
    data: any[];
    title: string;
    layout?: "vertical" | "horizontal";
    barDataKey: string;
    barFill: string;
    yAxisDataKey?: string;
    xAxisDataKey?: string;
    xaxisType?: "number" | "category";
    yaxisType?: "number" | "category";
}
const ChartBar: React.FC<ChartBar> = ({
    data,
    title,
    layout,
    barDataKey,
    barFill,
    yAxisDataKey,
    xAxisDataKey,
    yaxisType,
    xaxisType,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout={layout}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xAxisDataKey} type={xaxisType} />
                            <YAxis 
                                dataKey={yAxisDataKey} 
                                type={yaxisType} 
                                tick={yAxisDataKey === "topProductName" ? { fontSize: 11 } : undefined}
                            />
                            <Tooltip formatter={(value, name, props) => {
                                if (name === "quarterlySales") {
                                    const { payload } = props;
                                    return [
                                        <div className="flex flex-col">
                                            <span>Total Orders: {payload.total_orders}</span>
                                            <span>Total Revenue: ${value}</span>
                                        </div>
                                    ];
                                }
                                if (name === "topSellingProducts") {
                                    return [
                                        <div className="flex flex-col">
                                            <span>Total Sold: {value}</span>
                                        </div>
                                    ];
                                }
                            }} />
                            <Bar dataKey={barDataKey} fill={barFill} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChartBar;
