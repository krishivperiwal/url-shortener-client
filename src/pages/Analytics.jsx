import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function Analytics() {
  const { shortId } = useParams()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => { fetchAnalytics() }, [shortId])

  useEffect(() => {
    if (data && chartRef.current) {
      renderChart()
    }
  }, [data])

  async function fetchAnalytics() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/url/api/analytics/${shortId}`)
      setData(res.data)
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login') }
      setError(err.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  function renderChart() {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const clicksByDay = {}
    data.visitHistory.forEach(visit => {
      const date = new Date(visit.timestamp).toLocaleDateString()
      clicksByDay[date] = (clicksByDay[date] || 0) + 1
    })

    const labels = Object.keys(clicksByDay).sort((a, b) => new Date(a) - new Date(b))
    const counts = labels.map(l => clicksByDay[l])

    const ctx = chartRef.current.getContext('2d')
    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['No data'],
        datasets: [{
          label: 'Clicks per Day',
          data: counts.length > 0 ? counts : [0],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        }
      }
    })
  }

  const avgClicks = data ? Math.round(data.totalClicks / (data.uniqueDays || 1)) : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <p className="text-white text-lg">Loading analytics...</p>
    </div>
  )

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js" />

      <nav className="bg-white shadow px-8 py-4 flex items-center justify-between">
        <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🔗 URL Shortener
        </span>
        <Link to="/dashboard" className="bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-10 space-y-6">
        {error && <p className="text-white bg-red-500 rounded-lg px-4 py-3">{error}</p>}

        {data && (
          <>
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Analytics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Short URL</p>
                  <p className="font-mono font-bold text-gray-800">/{data.shortId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Original URL</p>
                  <p className="font-mono font-bold text-gray-800 truncate">{data.redirectUrl}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '🖱️', value: data.totalClicks, label: 'Total Clicks' },
                { icon: '📅', value: data.uniqueDays, label: 'Days Active' },
                { icon: '📈', value: avgClicks, label: 'Avg Clicks/Day' },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-xl p-6 shadow text-center">
                  <p className="text-4xl mb-3">{card.icon}</p>
                  <p className="text-4xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-sm text-gray-400 font-semibold mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Clicks Over Time</h3>
              <div style={{ height: '300px' }}>
                <canvas ref={chartRef} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🕐 Recent Activity</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {data.visitHistory.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-5xl mb-3">📭</p>
                    <p className="text-gray-400">No visits yet. Share your link to see activity!</p>
                  </div>
                ) : (
                  [...data.visitHistory].reverse().map((visit, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100">
                      <span className="text-indigo-500 text-xl">🖱️</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          {new Date(visit.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(visit.timestamp).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Analytics