import React from "react";
import DashboardCard from "../components/ui/DashboardCardItems/DashboardCard";
import NumberOfEnrollees from "../components/ui/DashboardCardItems/Dashboardenrollees";
import ClaimsChart from "../components/ui/DashboardCardItems/DashboardClaims";
import StatCard from "../components/ui/DashboardCardItems/StatCard";

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="grid grid-cols-2 grid-rows-2 gap-6">
        <DashboardCard
          indicatorColor="bg-blue-100 text-blue-600"
          value={125}
          percentage="2.5% Last Month"
          changeColor="text-red-500"
          title="New Claims"
        />
        <DashboardCard
          indicatorColor="bg-red-100 text-red-600"
          value={150}
          percentage="2.5% Last Month"
          changeColor="text-[#DC2626]-500"
          title="Approved"
        />
        <DashboardCard
          indicatorColor="bg-blue-100 text-blue-600"
          value={100}
          percentage="1.56% Last Month"
          changeColor="text-red-500"
          title="Disputed"
        />
        <DashboardCard
          indicatorColor="bg-orange-100 text-orange-600"
          value={125}
          title="Declined"
        />
      </div>

      <div className="flex flex-row gap-5 items-stretch">
        <div className="w-[60%]">
          <NumberOfEnrollees />
        </div>

        <div className="bg-white justify-center items-center w-[40%] flex flex-col gap-6">
          <StatCard
            percentage={45}
            title="Number of Patients"
            bgColor="bg-[#DC2626]-50"
            textColor="text-[#DC2626]-600"
            pathColor="#2C9A5B"
          />
          <StatCard
            percentage={75}
            title="Total Number Of Providers"
            bgColor="bg-red-50"
            textColor="text-red-600"
            pathColor="#D9534F"
          />
        </div>

      </div>
      <div>
        <ClaimsChart />
      </div>
    </div>
  );
};

export default Dashboard;
