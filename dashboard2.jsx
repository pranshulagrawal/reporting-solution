import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, AlertCircle, CheckCircle, Clock, TrendingUp, Users, PieChart as PieChartIcon, Calendar as CalendarIcon, Filter as FilterIcon, X as XIcon } from 'lucide-react';

// --- Data Generation Utility --- //
const generateDummyData = () => {
    const data = [];
    const today = new Date();
    const categories = ['Network', 'Software', 'Hardware', 'Login Issue'];
    const subCategories = {
        'Network': ['Firewall', 'VPN', 'Connectivity'],
        'Software': ['Application Crash', 'Update Failed', 'Permissions'],
        'Hardware': ['CPU Failure', 'Disk Space', 'Memory Leak'],
        'Login Issue': ['Password Reset', '2FA Error', 'Account Locked']
    };
    const assignees = ['Alex', 'Ben', 'Chris', 'David', 'Eva'];
    const responsibleTeams = ['Infra Team', 'App Support', 'Security', 'Desktop Support'];
    const statuses = ['Open', 'Resolved', 'In Progress', 'Pending User'];
    
    for (let i = 0; i < 90; i++) { // Generate data for the last 90 days
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        const dailyBreaks = Math.floor(Math.random() * 10) + 5;
        for (let j = 0; j < dailyBreaks; j++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            data.push({
                id: `BRK-${1000 + i * 15 + j}`,
                date: date.toISOString().split('T')[0],
                category: category,
                subCategory: subCategories[category][Math.floor(Math.random() * subCategories[category].length)],
                assignee: assignees[Math.floor(Math.random() * assignees.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                responsibleTeam: responsibleTeams[Math.floor(Math.random() * responsibleTeams.length)],
                ageing: Math.floor(Math.random() * 20),
                explanation: `Issue with ${category.toLowerCase()} on server ${101 + j}`,
                reoccurrence: Math.random() > 0.8,
            });
        }
    }
    return data;
};

const allData = generateDummyData();
const assigneeColors = {
    'Alex': '#0088FE', 'Ben': '#00C49F', 'Chris': '#FFBB28', 'David': '#FF8042', 'Eva': '#AF19FF'
};
const categoryColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Reusable Filter Dropdown --- //
const FilterDropdown = ({ options, value, onChange, title }) => (
    <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}:</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="p-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="all">All</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


// --- Components --- //

const KpiCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">{icon}</div>
    </div>
    <div><p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">{value}</p></div>
  </div>
);

const ChartContainer = ({ title, children, icon, filterSlot }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
    <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
            {icon}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white ml-2">{title}</h3>
        </div>
        {filterSlot}
    </div>
    <div className="flex-grow" style={{ width: '100%', height: '300px' }}>{children}</div>
  </div>
);

const AssigneePanel = ({ data }) => {
    const [sortKey, setSortKey] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredAssigneeData = useMemo(() => {
        const filtered = statusFilter === 'all' ? data : data.filter(d => d.status === statusFilter);
        const groups = filtered.reduce((acc, item) => {
            if (!acc[item.assignee]) acc[item.assignee] = { open: 0, resolved: 0, inProgress: 0 };
            if (item.status === 'Resolved') acc[item.assignee].resolved++;
            else if (item.status === 'Open') acc[item.assignee].open++;
            else acc[item.assignee].inProgress++;
            return acc;
        }, {});

        return Object.entries(groups).map(([name, stats]) => ({
            name,
            open: stats.open,
            resolved: stats.resolved,
            value: stats.open + stats.resolved + stats.inProgress,
            color: assigneeColors[name]
        }));
    }, [data, statusFilter]);

    const sortedData = useMemo(() => [...filteredAssigneeData].sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    }), [filteredAssigneeData, sortKey, sortOrder]);

    const handleSort = (key) => {
        const newKey = key.toLowerCase().replace(/ /g, '');
        setSortKey(newKey === 'assignee' ? 'name' : newKey);
        setSortOrder(sortKey === newKey ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
    };

    return (
        <ChartContainer 
            title="Assignee Health" 
            icon={<Users className="text-indigo-500" size={24} />}
            filterSlot={<FilterDropdown options={['Open', 'Resolved', 'In Progress', 'Pending User']} value={statusFilter} onChange={setStatusFilter} title="Status" />}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <div className="md:col-span-1 h-64 md:h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={filteredAssigneeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5}>
                                {filteredAssigneeData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="md:col-span-2 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                                {['Assignee', 'Open Breaks', 'Resolved', 'Total'].map(header => (
                                    <th key={header} className="py-2 px-4 font-medium cursor-pointer" onClick={() => handleSort(header)}>
                                        {header}
                                        {sortKey === header.toLowerCase().replace(/ /g, '').replace('assignee','name') && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((assignee) => (
                                <tr key={assignee.name} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
        </ChartContainer>
    );
};

const CustomDateRangeModal = ({ isOpen, onClose, onApply }) => {
    const today = new Date().toISOString().split('T')[0];
    const [start, setStart] = useState(today);
    const [end, setEnd] = useState(today);
    if (!isOpen) return null;
    const handleApply = () => { if (start && end && new Date(start) <= new Date(end)) onApply(start, end); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Custom Date Range</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                        <input type="date" value={start} onChange={e => setStart(e.target.value)} max={today} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                        <input type="date" value={end} onChange={e => setEnd(e.target.value)} max={today} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-md" />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                    <button onClick={handleApply} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Apply</button>
                </div>
            </div>
        </div>
    );
};

const BreakDataTable = ({ data }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredTableData = useMemo(() => {
        return statusFilter === 'all' ? data : data.filter(d => d.status === statusFilter);
    }, [data, statusFilter]);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTableData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTableData, currentPage]);

    const totalPages = Math.ceil(filteredTableData.length / itemsPerPage);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md col-span-1 lg:col-span-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Break Details</h3>
                <FilterDropdown options={['Open', 'Resolved', 'In Progress', 'Pending User']} value={statusFilter} onChange={setStatusFilter} title="Status" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                            <th className="py-2 px-4">Break ID</th><th className="py-2 px-4">Category</th><th className="py-2 px-4">Sub-Category</th><th className="py-2 px-4">Assignee</th><th className="py-2 px-4">Status</th><th className="py-2 px-4">Age (days)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(item => (
                            <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">{item.id}</td>
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.category}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.subCategory}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.assignee}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        item.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        item.status === 'Open' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}>{item.status}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.ageing}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                <div className="space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50">Prev</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [activePieFilter, setActivePieFilter] = useState(null);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('Last 7 Days');
  const [dateRange, setDateRange] = useState({start: null, end: null});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dateFilteredData = useMemo(() => {
    const today = new Date();
    let startDate = new Date();
    const endDate = new Date(today);

    if (dateRange.start && dateRange.end) {
        startDate = new Date(dateRange.start);
        endDate.setDate(new Date(dateRange.end).getDate() + 1);
    } else {
        startDate.setDate(today.getDate() - 6);
    }
    return allData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate < endDate;
    });
  }, [dateRange]);

  const kpiData = useMemo(() => {
    const openBreaks = dateFilteredData.filter(d => d.status !== 'Resolved');
    return {
        todaysBreaks: dateFilteredData.filter(d => d.date === new Date().toISOString().split('T')[0]).length,
        agedBreaks: openBreaks.filter(d => d.ageing > 5).length,
        openBreaks: openBreaks.length,
        resolvedPercentage: dateFilteredData.length > 0 ? Math.round((dateFilteredData.filter(d => d.status === 'Resolved').length / dateFilteredData.length) * 100) : 0,
    };
  }, [dateFilteredData]);

  const lineChartData = useMemo(() => {
    const groups = dateFilteredData.reduce((acc, item) => {
        const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(groups).map(([name, breaks]) => ({ name, breaks })).reverse();
  }, [dateFilteredData]);

  const pieChartData = useMemo(() => {
    const groups = dateFilteredData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [dateFilteredData]);

  useEffect(() => { handleRangeChange('Last 7 Days', 7); }, []);
  const handlePieClick = (data, index) => setActivePieFilter(activePieFilter === data.name ? null : data.name);
  const handleRangeChange = (rangeLabel, days) => {
    setSelectedRangeLabel(rangeLabel);
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (days - 1));
    setDateRange({ start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] });
    setIsDateDropdownOpen(false);
  };
  const handleCustomDateApply = (start, end) => {
    setSelectedRangeLabel(`Custom: ${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`);
    setDateRange({ start, end });
    setIsModalOpen(false);
  };
  const openCustomModal = () => { setIsModalOpen(true); setIsDateDropdownOpen(false); }
  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDateDropdownOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operational Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time operational break analysis.</p>
            </div>
            <div className="relative mt-4 sm:mt-0" ref={dropdownRef}>
                <button onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)} className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg shadow-sm">
                    <CalendarIcon size={16} className="mr-2 text-indigo-500"/>{selectedRangeLabel}<ChevronDown size={16} className={`ml-2 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isDateDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border dark:border-gray-700">
                        <a onClick={() => handleRangeChange('Last 7 Days', 7)} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Last 7 Days</a>
                        <a onClick={() => handleRangeChange('Last 15 Days', 15)} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Last 15 Days</a>
                        <a onClick={() => handleRangeChange('Last 30 Days', 30)} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Last 30 Days</a>
                        <div className="border-t my-1"></div>
                        <a onClick={openCustomModal} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Custom Range...</a>
                    </div>
                )}
            </div>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard title="Today's Breaks" value={kpiData.todaysBreaks} icon={<Clock className="text-indigo-500" size={24}/>} />
            <KpiCard title="Aged Breaks >5d" value={kpiData.agedBreaks} icon={<AlertCircle className="text-indigo-500" size={24}/>} />
            <KpiCard title="Open Breaks" value={kpiData.openBreaks} icon={<TrendingUp className="text-indigo-500" size={24}/>} />
            <KpiCard title="Resolved %" value={`${kpiData.resolvedPercentage}%`} icon={<CheckCircle className="text-indigo-500" size={24}/>} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-3">
              <ChartContainer title="Break Trends" icon={<TrendingUp className="text-indigo-500" size={24}/>}>
                <ResponsiveContainer><LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" /><XAxis dataKey="name" tick={{ fill: '#9CA3AF' }}/><YAxis tick={{ fill: '#9CA3AF' }}/><Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }} /><Legend /><Line type="monotone" dataKey="breaks" stroke="#6366F1" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="lg:col-span-2">
              <ChartContainer title="Breaks by Category" icon={<PieChartIcon className="text-indigo-500" size={24}/>}>
                <ResponsiveContainer><PieChart><Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" onClick={handlePieClick}>{pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} className="cursor-pointer" style={{ opacity: activePieFilter === null || activePieFilter === entry.name ? 1 : 0.3 }}/>))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
             <AssigneePanel data={dateFilteredData} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
             <BreakDataTable data={dateFilteredData} />
          </div>
        </main>
      </div>
      <CustomDateRangeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onApply={handleCustomDateApply}/>
    </div>
  );
}
