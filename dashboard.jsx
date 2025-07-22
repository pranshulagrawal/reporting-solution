import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, AlertCircle, CheckCircle, Clock, TrendingUp, Users, PieChart as PieChartIcon, Calendar as CalendarIcon } from 'lucide-react';

// --- Data Generation Utility --- //
const generateDummyData = () => {
    const data = [];
    const today = new Date();
    const categories = ['Network', 'Software', 'Hardware', 'Login Issue'];
    const assignees = ['Alex', 'Ben', 'Chris', 'David', 'Eva'];
    
    for (let i = 0; i < 90; i++) { // Generate data for the last 90 days
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        const dailyBreaks = Math.floor(Math.random() * 10) + 5; // 5 to 14 breaks per day
        for (let j = 0; j < dailyBreaks; j++) {
            const isResolved = Math.random() > 0.3; // 70% chance of being resolved
            data.push({
                date: date.toISOString().split('T')[0], // YYYY-MM-DD format
                category: categories[Math.floor(Math.random() * categories.length)],
                assignee: assignees[Math.floor(Math.random() * assignees.length)],
                status: isResolved ? 'Resolved' : 'Open',
            });
        }
    }
    return data;
};

const allData = generateDummyData();
const assigneeColors = {
    'Alex': '#0088FE',
    'Ben': '#00C49F',
    'Chris': '#FFBB28',
    'David': '#FF8042',
    'Eva': '#AF19FF'
};
const categoryColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


// --- Components --- //

const KpiCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
        {icon}
      </div>
    </div>
    <div>
      <p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">{value}</p>
    </div>
  </div>
);

const ChartContainer = ({ title, children, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white ml-2">{title}</h3>
    </div>
    <div style={{ width: '100%', height: 300 }}>
      {children}
    </div>
  </div>
);

const AssigneePanel = ({ data }) => {
    const [sortKey, setSortKey] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSort = (key) => {
        const newKey = key.toLowerCase().replace(' ', '');
        if (sortKey === newKey) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(newKey);
            setSortOrder('asc');
        }
    };
    
    const sortKeyMap = {
        assignee: 'name',
        openbreaks: 'open',
        resolved: 'resolved',
        total: 'value'
    };

    const sortedData = useMemo(() => [...data].sort((a, b) => {
        const key = sortKeyMap[sortKey];
        if (a[key] < b[key]) return sortOrder === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    }), [data, sortKey, sortOrder]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md col-span-1 lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
                <Users className="text-indigo-500" size={24} />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white ml-2">Assignee Health Panel</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 h-64 md:h-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="md:col-span-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                                    {['Assignee', 'Open Breaks', 'Resolved', 'Total'].map(header => (
                                        <th key={header} className="py-2 px-4 font-medium cursor-pointer" onClick={() => handleSort(header)}>
                                            {header}
                                            {sortKey === header.toLowerCase().replace(' ', '') && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((assignee, index) => (
                                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3 px-4 flex items-center">
                                            <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: assignee.color }}></div>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{assignee.name}</span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{assignee.open}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{assignee.resolved}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{assignee.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomDateRangeModal = ({ isOpen, onClose, onApply }) => {
    const today = new Date().toISOString().split('T')[0];
    const [start, setStart] = useState(today);
    const [end, setEnd] = useState(today);

    if (!isOpen) return null;

    const handleApply = () => {
        if (start && end && new Date(start) <= new Date(end)) {
            onApply(start, end);
        } else {
            // Simple validation feedback
            alert("End date must be after start date.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Custom Date Range</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                        <input type="date" value={start} onChange={e => setStart(e.target.value)} max={today} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                        <input type="date" value={end} onChange={e => setEnd(e.target.value)} max={today} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-200" />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleApply} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Apply</button>
                </div>
            </div>
        </div>
    );
};


export default function App() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('Last 7 Days');
  const [dateRange, setDateRange] = useState({start: null, end: null});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State for filtered data
  const [filteredData, setFilteredData] = useState([]);

  // Memoized calculations for display data
  const kpiData = useMemo(() => {
    if (!filteredData.length) return { todaysBreaks: 0, agedBreaks: 0, openBreaks: 0, resolvedPercentage: 0 };
    
    const todayStr = new Date().toISOString().split('T')[0];
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const openBreaks = filteredData.filter(d => d.status === 'Open');
    const resolvedBreaks = filteredData.filter(d => d.status === 'Resolved');
    
    const resolvedPercentage = filteredData.length > 0
        ? Math.round((resolvedBreaks.length / filteredData.length) * 100)
        : 0;

    return {
        todaysBreaks: filteredData.filter(d => d.date === todayStr).length,
        agedBreaks: openBreaks.filter(d => new Date(d.date) < fiveDaysAgo).length,
        openBreaks: openBreaks.length,
        resolvedPercentage: resolvedPercentage,
    };
  }, [filteredData]);

  const lineChartData = useMemo(() => {
    const groups = filteredData.reduce((acc, item) => {
        const date = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(groups).map(([name, breaks]) => ({ name, breaks })).reverse();
  }, [filteredData]);

  const pieChartData = useMemo(() => {
    const groups = filteredData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const assigneeData = useMemo(() => {
    const groups = filteredData.reduce((acc, item) => {
        if (!acc[item.assignee]) {
            acc[item.assignee] = { open: 0, resolved: 0 };
        }
        if (item.status === 'Open') acc[item.assignee].open++;
        else acc[item.assignee].resolved++;
        return acc;
    }, {});

    return Object.entries(groups).map(([name, stats]) => ({
        name,
        open: stats.open,
        resolved: stats.resolved,
        value: stats.open + stats.resolved,
        color: assigneeColors[name]
    }));
  }, [filteredData]);


  // Effect to filter data when dateRange changes
  useEffect(() => {
    const today = new Date();
    let startDate = new Date();
    const endDate = new Date(today);

    if (dateRange.start && dateRange.end) {
        startDate = new Date(dateRange.start);
        endDate.setDate(new Date(dateRange.end).getDate() + 1); // Include end date
    } else { // Default to "Last 7 Days"
        startDate.setDate(today.getDate() - 6);
    }

    const filtered = allData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate < endDate;
    });
    setFilteredData(filtered);
  }, [dateRange]);


  const handlePieClick = (data, index) => {
    setActiveFilter(activeFilter === data.name ? null : data.name);
  };

  const handleRangeChange = (rangeLabel, days) => {
    setSelectedRangeLabel(rangeLabel);
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (days - 1));
    setDateRange({ 
        start: start.toISOString().split('T')[0], 
        end: today.toISOString().split('T')[0] 
    });
    setIsDateDropdownOpen(false);
  };
  
  const handleCustomDateApply = (start, end) => {
    const formattedStart = new Date(start).toLocaleDateString();
    const formattedEnd = new Date(end).toLocaleDateString();
    setSelectedRangeLabel(`Custom: ${formattedStart} - ${formattedEnd}`);
    setDateRange({ start, end });
    setIsModalOpen(false);
  };
  
  const openCustomModal = () => {
    setIsModalOpen(true);
    setIsDateDropdownOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, here's your operational overview.</p>
            </div>
            <div className="relative mt-4 sm:mt-0" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                    className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                    <CalendarIcon size={16} className="mr-2 text-indigo-500"/>
                    {selectedRangeLabel} 
                    <ChevronDown size={16} className={`ml-2 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isDateDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                        <a onClick={() => handleRangeChange('Last 7 Days', 7)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Last 7 Days</a>
                        <a onClick={() => handleRangeChange('Last 15 Days', 15)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Last 15 Days</a>
                        <a onClick={() => handleRangeChange('Last 30 Days', 30)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Last 30 Days</a>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <a onClick={openCustomModal} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Custom Range...</a>
                    </div>
                )}
            </div>
        </header>

        <main>
          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard title="Today's Breaks" value={kpiData.todaysBreaks} icon={<Clock className="text-indigo-500" size={24}/>} />
            <KpiCard title="Aged Breaks >5d" value={kpiData.agedBreaks} icon={<AlertCircle className="text-indigo-500" size={24}/>} />
            <KpiCard title="Open Breaks" value={kpiData.openBreaks} icon={<TrendingUp className="text-indigo-500" size={24}/>} />
            <KpiCard title="Resolved %" value={`${kpiData.resolvedPercentage}%`} icon={<CheckCircle className="text-indigo-500" size={24}/>} />
          </div>

          {/* Row 2: Visual Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-3">
              <ChartContainer title="Break Trends" icon={<TrendingUp className="text-indigo-500" size={24}/>}>
                <ResponsiveContainer>
                  <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }}/>
                    <YAxis tick={{ fill: '#9CA3AF' }}/>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }} labelStyle={{ color: '#F9FAFB' }}/>
                    <Legend />
                    <Line type="monotone" dataKey="breaks" stroke="#6366F1" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="lg:col-span-2">
              <ChartContainer title="Breaks by Category" icon={<PieChartIcon className="text-indigo-500" size={24}/>}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={handlePieClick}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} 
                              className="cursor-pointer transition-opacity"
                              style={{ opacity: activeFilter === null || activeFilter === entry.name ? 1 : 0.3 }}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Row 3: Assignee Health Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <AssigneePanel data={assigneeData} />
          </div>
        </main>
      </div>
      <CustomDateRangeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleCustomDateApply}
      />
    </div>
  );
}
