import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Landmark, 
  TrendingUp,
  Plus,
  List,
  Settings,
  TestTube2,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Filter,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Award,
  Eye,
  X
} from 'lucide-react';
import { useBillStats } from '../hooks/useApiHooks';
import { format, startOfMonth, startOfYear, parseISO } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

function Dashboard() {
  const [dateRange, setDateRange] = useState('today');
  const [customDates, setCustomDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [showPaymentBreakdown, setShowPaymentBreakdown] = useState(false);

  // Prepare params for API call
  const apiParams = useMemo(() => {
    const params = { dateRange };
    if (dateRange === 'custom' && customDates.startDate && customDates.endDate) {
      params.startDate = customDates.startDate;
      params.endDate = customDates.endDate;
    }
    return params;
  }, [dateRange, customDates]);

  const { stats, loading, error, refresh } = useBillStats(apiParams);

  const dateFilterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'overall', label: 'Overall' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Chart configurations
  const monthlyRevenueChartData = useMemo(() => {
    if (!stats.monthlyTrend?.length) return null;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      labels: stats.monthlyTrend.map(item => monthNames[item._id.month - 1]),
      datasets: [
        {
          label: 'Revenue',
          data: stats.monthlyTrend.map(item => item.revenue),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
        },
        {
          label: 'Cases',
          data: stats.monthlyTrend.map(item => item.count),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ]
    };
  }, [stats.monthlyTrend]);



  // Pie chart data for referring doctors
  const doctorsPieChartData = useMemo(() => {
    if (!stats.topDoctors?.length) return null;
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];
    
    return {
      labels: stats.topDoctors.map(doctor => `Dr. ${doctor.name}`),
      datasets: [{
        data: stats.topDoctors.map(doctor => doctor.totalAmount),
        backgroundColor: colors.slice(0, stats.topDoctors.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      }]
    };
  }, [stats.topDoctors]);

  // Pie chart data for test groups
  const testGroupsPieChartData = useMemo(() => {
    if (!stats.topTestGroups?.length) return null;
    
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F97316', '#06B6D4', '#84CC16'];
    
    return {
      labels: stats.topTestGroups.map(group => group.name),
      datasets: [{
        data: stats.topTestGroups.map(group => group.revenue),
        backgroundColor: colors.slice(0, stats.topTestGroups.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      }]
    };
  }, [stats.topTestGroups]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  };

  // Fixed pie chart options to prevent shrinking on hover
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  };

  // Calculate performance indicators
  const performanceIndicators = useMemo(() => {
    if (!stats) return null;
    
    const collectionRate = stats.collectionEfficiency || 0;
    const avgBillValue = stats.averageBillValue || 0;
    const totalCases = stats.totalCases || 0;
    
    return {
      collectionRate: {
        value: collectionRate,
        status: collectionRate >= 80 ? 'excellent' : collectionRate >= 60 ? 'good' : 'needs_attention',
        trend: collectionRate >= 75 ? 'up' : 'down'
      },
      avgBillValue: {
        value: avgBillValue,
        status: avgBillValue >= 2000 ? 'excellent' : avgBillValue >= 1000 ? 'good' : 'needs_attention',
        trend: avgBillValue >= 1500 ? 'up' : 'down'
      },
      totalCases: {
        value: totalCases,
        status: totalCases >= 100 ? 'excellent' : totalCases >= 50 ? 'good' : 'needs_attention',
        trend: totalCases >= 75 ? 'up' : 'down'
      }
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive overview of your pathology lab operations
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="form-select text-sm"
            >
              {dateFilterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Activity className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {dateRange === 'custom' && (
        <div className="flex items-center justify-end space-x-2">
          <input
            type="date"
            value={customDates.startDate}
            onChange={(e) => setCustomDates(prev => ({ ...prev, startDate: e.target.value }))}
            className="form-input text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customDates.endDate}
            onChange={(e) => setCustomDates(prev => ({ ...prev, endDate: e.target.value }))}
            className="form-input text-sm"
          />
        </div>
      )}

      {/* Performance Indicators */}
      {performanceIndicators && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Collection Rate</p>
                  <p className="text-2xl font-bold text-blue-900">{performanceIndicators.collectionRate.value.toFixed(2)}%</p>
                </div>
                <div className={`p-2 rounded-full ${
                  performanceIndicators.collectionRate.status === 'excellent' ? 'bg-green-100' :
                  performanceIndicators.collectionRate.status === 'good' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {performanceIndicators.collectionRate.trend === 'up' ? 
                    <ArrowUpRight className="h-5 w-5 text-green-600" /> : 
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Avg Bill Value</p>
                  <p className="text-2xl font-bold text-green-900">₹{Math.round(performanceIndicators.avgBillValue.value).toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  performanceIndicators.avgBillValue.status === 'excellent' ? 'bg-green-100' :
                  performanceIndicators.avgBillValue.status === 'good' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {performanceIndicators.avgBillValue.trend === 'up' ? 
                    <ArrowUpRight className="h-5 w-5 text-green-600" /> : 
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Cases</p>
                  <p className="text-2xl font-bold text-purple-900">{performanceIndicators.totalCases.value}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  performanceIndicators.totalCases.status === 'excellent' ? 'bg-green-100' :
                  performanceIndicators.totalCases.status === 'good' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {performanceIndicators.totalCases.trend === 'up' ? 
                    <ArrowUpRight className="h-5 w-5 text-green-600" /> : 
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Cases */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Cases</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalCases}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Paid Bills */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-600 p-3 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paid Bills</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.paidBillsCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Dues Bills */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Dues Bills</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.pendingPaymentCount}</dd>
                  <dd className="text-xs text-gray-500">Including partial payments</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Bill Amount */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Bill Amount</dt>
                  <dd className="text-2xl font-semibold text-gray-900">₹{Math.round(stats.averageBillValue).toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                 {/* Total Revenue */}
         <div className="card">
           <div className="card-body">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <div className="bg-green-500 p-3 rounded-lg">
                   <Landmark className="h-6 w-6 text-white" />
                 </div>
               </div>
               <div className="ml-5 w-0 flex-1">
                 <dl>
                   <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                   <dd className="text-lg font-semibold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</dd>
                   <dd className="text-xs text-gray-500">All bill amounts</dd>
                 </dl>
               </div>
               <div className="flex-shrink-0 ml-4">
                 <button
                   onClick={() => setShowPaymentBreakdown(true)}
                   className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                   title="View Payment Breakdown"
                 >
                   <Eye className="h-5 w-5" />
                 </button>
               </div>
             </div>
           </div>
         </div>

        {/* Payment Received */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-emerald-500 p-3 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Payment Received</dt>
                  <dd className="text-lg font-semibold text-gray-900">₹{stats.totalPaymentReceived.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Dues Amount */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-orange-500 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Dues Amount</dt>
                  <dd className="text-lg font-semibold text-gray-900">₹{stats.pendingPaymentAmount.toLocaleString()}</dd>
                  <dd className="text-xs text-gray-500">{stats.pendingPaymentCount} cases</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-indigo-500 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Collection Rate</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.collectionEfficiency.toFixed(2)}%</dd>
                  <dd className="text-xs text-gray-500">% of bills fully paid</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
                 {monthlyRevenueChartData && (
           <div className="card">
             <div className="card-header">
               <h3 className="text-lg font-medium text-gray-900 flex items-center">
                 <BarChart3 className="h-5 w-5 mr-2" />
                 Monthly Revenue Trend
               </h3>
             </div>
             <div className="card-body" style={{ height: '300px' }}>
               <Bar data={monthlyRevenueChartData} options={chartOptions} />
             </div>
           </div>
         )}

        
      </div>

      {/* Pie Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referring Doctors Pie Chart */}
        {doctorsPieChartData && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Referring Doctors Distribution
              </h3>
              <p className="text-sm text-gray-500 mt-1">Total amount referred by each doctor</p>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <Pie data={doctorsPieChartData} options={pieChartOptions} />
            </div>
          </div>
        )}

        {/* Test Groups Pie Chart */}
        {testGroupsPieChartData && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Test Groups Distribution
              </h3>
              <p className="text-sm text-gray-500 mt-1">Revenue generated by each test group</p>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <Pie data={testGroupsPieChartData} options={pieChartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Performance Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referring Doctors */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Referring Doctors
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {stats.topDoctors?.slice(0, 5).map((doctor, index) => (
                <div key={`${doctor.name}-${doctor.phone}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white mr-3 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index === 0 ? <Award className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                      <p className="text-sm text-gray-500">{doctor.qualification || 'N/A'} • {doctor.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{doctor.totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{doctor.billCount} bills</p>
                  </div>
                </div>
              ))}
              {(!stats.topDoctors || stats.topDoctors.length === 0) && (
                <p className="text-gray-500 text-center py-4">No doctor data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing Test Groups */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <TestTube2 className="h-5 w-5 mr-2" />
              Top Performing Test Groups
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {stats.topTestGroups?.slice(0, 5).map((group, index) => (
                <div key={group._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white mr-3 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index === 0 ? <Target className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{group.name}</p>
                      <p className="text-sm text-gray-500">₹{group.revenue.toLocaleString()} revenue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{group.count}</p>
                    <p className="text-sm text-gray-500">cases</p>
                  </div>
                </div>
              ))}
              {(!stats.topTestGroups || stats.topTestGroups.length === 0) && (
                <p className="text-gray-500 text-center py-4">No test group data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/billing/create"
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="card-body text-center">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Create New Bill</h3>
              <p className="text-xs text-gray-500">Generate a new bill for patient</p>
            </div>
          </Link>

          <Link
            to="/billing/list"
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="card-body text-center">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <List className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">View Bills</h3>
              <p className="text-xs text-gray-500">View and manage all bills</p>
            </div>
          </Link>

          <Link
            to="/admin/test-groups"
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="card-body text-center">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TestTube2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Manage Tests</h3>
              <p className="text-xs text-gray-500">Add and manage lab tests</p>
            </div>
          </Link>

          <Link
            to="/admin/doctors"
            className="card hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="card-body text-center">
              <div className="bg-indigo-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Manage Doctors</h3>
              <p className="text-xs text-gray-500">View referring doctors</p>
            </div>
          </Link>
        </div>
      </div>

             {/* Payment Breakdown Modal */}
       {showPaymentBreakdown && (
         <div 
           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
           onClick={() => setShowPaymentBreakdown(false)}
         >
           <div 
             className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                 <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                 Payment Method Breakdown
               </h3>
               <button
                 onClick={() => setShowPaymentBreakdown(false)}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <X className="h-5 w-5" />
               </button>
             </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {stats.paymentMethodBreakdown && stats.paymentMethodBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {stats.paymentMethodBreakdown.map((item, index) => {
                    const percentage = ((item.amount / stats.totalRevenue) * 100).toFixed(1);
                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: color }}
                          ></div>
                          <div>
                            <p className="font-medium text-gray-900">{item._id}</p>
                            <p className="text-sm text-gray-500">{percentage}% of total revenue</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{item.count || 0} transactions</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">Total Revenue</p>
                      <p className="font-semibold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payment method data available</p>
                  <p className="text-sm text-gray-400 mt-2">Payment breakdown will appear here when available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 