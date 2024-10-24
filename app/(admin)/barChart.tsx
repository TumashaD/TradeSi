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
                            <YAxis dataKey={yAxisDataKey} type={yaxisType} />
                            <Tooltip />
                            <Bar dataKey={barDataKey} fill={barFill} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChartBar;
