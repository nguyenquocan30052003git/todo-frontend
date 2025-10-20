// src/AdminDashboard.jsx
import { useState, useEffect } from 'react';

const API_URL = 'https://todo-api-ovrr.onrender.com/api/visitors';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [byCountry, setByCountry] = useState([]);
  const [byDevice, setByDevice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
    // Refresh data mỗi 10 giây
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, visitorsRes, countryRes, deviceRes] = await Promise.all([
        fetch(`${API_URL}/stats/overview`),
        fetch(API_URL),
        fetch(`${API_URL}/by-country`),
        fetch(`${API_URL}/by-device`)
      ]);

      const statsData = await statsRes.json();
      const visitorsData = await visitorsRes.json();
      const countryData = await countryRes.json();
      const deviceData = await deviceRes.json();

      if (statsData.success) setStats(statsData.data);
      if (visitorsData.success) setVisitors(visitorsData.data);
      if (countryData.success) setByCountry(countryData.data);
      if (deviceData.success) setByDevice(deviceData.data);
    } catch (error) {
      console.error('Lỗi fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📊 Visitor Analytics Dashboard</h1>
          <p className="text-gray-400">Theo dõi khách truy cập website</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          {['overview', 'visitors', 'geography', 'devices'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition capitalize ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'geography' ? '🌍 Geography' : 
               tab === 'devices' ? '📱 Devices' :
               tab === 'visitors' ? '👥 Visitors' :
               '📈 Overview'}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && <p className="text-center text-gray-400 py-4">Đang tải...</p>}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg">
              <p className="text-blue-200 text-sm mb-2">👤 Unique Visitors</p>
              <p className="text-3xl font-bold">{stats.unique_visitors}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg">
              <p className="text-green-200 text-sm mb-2">📍 Total Visits</p>
              <p className="text-3xl font-bold">{stats.total_visits}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg">
              <p className="text-purple-200 text-sm mb-2">📱 Device Types</p>
              <p className="text-3xl font-bold">{stats.device_types}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-lg">
              <p className="text-orange-200 text-sm mb-2">🌍 Countries</p>
              <p className="text-3xl font-bold">{stats.countries}</p>
            </div>
          </div>
        )}

        {/* Visitors Tab */}
        {activeTab === 'visitors' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">IP Address</th>
                  <th className="px-6 py-3 text-left">Device</th>
                  <th className="px-6 py-3 text-left">Country</th>
                  <th className="px-6 py-3 text-left">Visits</th>
                  <th className="px-6 py-3 text-left">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {visitors.slice(0, 20).map(visitor => (
                  <tr key={visitor.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="px-6 py-3 font-mono text-gray-300">{visitor.ip_address}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
                        {visitor.device_type}
                      </span>
                    </td>
                    <td className="px-6 py-3">{visitor.country}</td>
                    <td className="px-6 py-3 font-bold">{visitor.visit_count}</td>
                    <td className="px-6 py-3 text-gray-400">
                      {new Date(visitor.last_visited).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Geography Tab */}
        {activeTab === 'geography' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">🌍 Visitors by Country</h3>
              <div className="space-y-3">
                {byCountry.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{item.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...byCountry.map(c => c.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-blue-400 min-w-10 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">📊 Top Countries</h3>
              <div className="space-y-2">
                {byCountry.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-2xl">{idx + 1}.</span>
                    <span className="flex-1">{item.country}</span>
                    <span className="px-3 py-1 bg-green-900 text-green-300 rounded text-sm font-bold">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="grid grid-cols-3 gap-4">
            {byDevice.map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-lg text-center">
                <p className="text-indigo-200 mb-2">
                  {item.device_type === 'desktop' && '💻'}
                  {item.device_type === 'mobile' && '📱'}
                  {item.device_type === 'tablet' && '📱'}
                  {' '}{item.device_type.toUpperCase()}
                </p>
                <p className="text-4xl font-bold text-white">{item.count}</p>
                <p className="text-indigo-300 text-sm mt-2">
                  {((item.count / byDevice.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}