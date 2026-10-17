import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '../utils/cn';

const StatCard = ({ icon, title, value, trend, trendUp, colorClass = "text-indigo-600", bgClass = "bg-indigo-100", className, onClick }) => {
  return (
    <Card 
      className={cn("transition-shadow", onClick ? "cursor-pointer hover:shadow-md hover:border-indigo-200" : "hover:shadow-md", className)}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-xl", bgClass)}>
            {icon}
          </div>
          {trend && (
            <div className={cn("flex items-center space-x-1 text-sm font-medium", trendUp ? 'text-emerald-600' : 'text-rose-600')}>
              <span>{trend}</span>
              {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
