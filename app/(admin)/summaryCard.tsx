import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
    title: string;
    amount: string;
    logo: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount ,logo}) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">{logo}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{amount}</div>
            </CardContent>
        </Card>
    );
};

export default SummaryCard;