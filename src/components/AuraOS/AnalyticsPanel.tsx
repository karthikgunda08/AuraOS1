// src/components/AuraOS/AnalyticsPanel.tsx
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../state/appStore';
import * as projectService from '../../services/projectService';
import { LoadingSpinner } from '../LoadingSpinner';
import { ProjectAnalyticsData } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-slate-700/80 border border-slate-600 rounded-md shadow-lg text-sm">
        <p className="label text-slate-200">{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const KpiMetric: React.FC<{ label: string; value: string; color: string; }> = ({ label, value, color }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </div>
);

const AnalyticsContent: React.FC<{ data: ProjectAnalyticsData }> = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
             <KpiMetric label="Vastu Compliance" value={`${data.vastuScore}%`} color={data.vastuScore > 75 ? 'text-green-400' : data.vastuScore > 50 ? 'text-yellow-400' : 'text-red-400'} />
             <KpiMetric label="Sustainability Score" value={`${data.sustainabilityScore}/100`} color={data.sustainabilityScore > 75 ? 'text-green-400' : 'text-slate-200'} />
        </div>
        
        <div className="bg-slate-800/50 p-4 rounded-lg">
             <h4 className="font-semibold text-slate-200 text-center mb-2">Material Distribution</h4>
             {data.materialDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={data.materialDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                            {data.materialDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Run BoQ to see data.</div>
             )}
        </div>
        
         <div className="bg-slate-800/50 p-4 rounded-lg">
             <h4 className="font-semibold text-slate-200 text-center mb-2">AI Credit Usage</h4>
              {data.creditUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.creditUsage} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} content={<CustomTooltip />} />
                        <Bar dataKey="cost" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No credits spent on this project yet.</div>
              )}
        </div>
    </div>
);


const AnalyticsPanel: React.FC = () => {
    const { currentProject, projectAnalyticsData, setProjectAnalyticsData } = useAppStore(state => ({
        currentProject: state.currentProject,
        projectAnalyticsData: state.projectAnalyticsData,
        setProjectAnalyticsData: state.setProjectAnalyticsData,
    }));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentProject?.id) {
            setIsLoading(true);
            projectService.getProjectAnalytics(currentProject.id)
                .then(data => setProjectAnalyticsData(data))
                .catch(err => console.error("Failed to fetch project analytics", err))
                .finally(() => setIsLoading(false));
        }
    }, [currentProject, setProjectAnalyticsData]);

    return (
        <div className="h-full w-full overflow-y-auto">
            {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}
            {!isLoading && projectAnalyticsData && <AnalyticsContent data={projectAnalyticsData} />}
            {!isLoading && !projectAnalyticsData && <div className="flex items-center justify-center h-full text-slate-400">No analytics data available.</div>}
        </div>
    );
};

export default AnalyticsPanel;