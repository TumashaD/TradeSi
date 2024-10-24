import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface ChartLine {
    data: any[];
}
const ChartLine: React.FC<ChartLine> = ({ data }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Interest Trends</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="views"
                                stroke="#3b82f6"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="orders"
                                stroke="#10b981"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChartLine;
