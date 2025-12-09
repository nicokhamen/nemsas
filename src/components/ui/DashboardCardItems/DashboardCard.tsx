import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  percentage?: string; 
  changeColor?: string; 
  indicatorColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  percentage,
  changeColor ,
  indicatorColor,
}) => {
  return (
    <div className="bg-white shadow-md border p-6 flex flex-col gap-2 w-full">
      <div className="flex items-start gap-3">
        <span className={`inline-block w-10 h-10 ${indicatorColor}`}></span>

        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {percentage && <span className={`text-sm ${changeColor}`}>{percentage}</span>}
        </div>
      </div>

    
      <h4 className="text-gray-600 text-sm font-medium">{title}</h4>
    </div>
  );
};

export default DashboardCard;