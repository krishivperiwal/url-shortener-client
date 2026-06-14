import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successUrl, setSuccessUrl] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => { fetchUrls() }, [])

  async function fetchUrls() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/url/api/urls')
      setUrls(res.data)
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login') }
      setError('Failed to load URLs')
    } finally {
      setLoading(false)
    }
  }

  async function onShorten(data) {
    setError('')
    setSuccessUrl('')
    try {
      const res = await api.post('/url/api/shorten', { originalUrl: data.url })
      setSuccessUrl(res.data.shortUrl)
      reset()
      await fetchUrls()
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login') }
      setError(err.response?.data?.message || 'Failed to shorten URL')
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function copyToClipboard(shortId) {
    const fullUrl = `http://localhost:5000/${shortId}`
    await navigator.clipboard.writeText(fullUrl)
    setCopiedId(shortId)
    setTimeout(() => setCopiedId(''), 2000)
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <nav className="bg-white shadow px-8 py-4 flex items-center justify-between">
        <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🔗 URL Shortener
        </span>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm font-semibold">👤 {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-10 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back!</h2>
          <p className="text-gray-500 text-sm">Create short URLs and track their performance with analytics.</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">✨ Create New Short URL</h3>

          {successUrl && (
            <div className="bg-green-50 border-2 border-green-400 text-green-700 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
              <div>
                <strong>Success!</strong> Your short URL:{' '}
                <span className="font-mono">{successUrl}</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(successUrl)}
                className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg ml-4"
              >
                Copy
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit(onShorten)} className="flex gap-3">
            <input
              className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              type="url"
              placeholder="https://example.com/very/long/url"
              {...register('url', { required: true })}
            />
            <button
              className="text-white font-semibold px-6 py-3 rounded-lg text-sm disabled:opacity-50 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Shortening...' : '✨ Shorten URL'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl p-6 shadow overflow-x-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Your Short URLs</h3>

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : urls.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-gray-400">No short URLs yet. Create your first one above!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8">No.</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Short ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Original URL</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Clicks</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url, index) => (
                  <tr key={url._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5000/${url.shortId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-semibold text-indigo-600 hover:underline"
                        >
                          /{url.shortId}
                        </a>
                        <button
                          onClick={() => copyToClipboard(url.shortId)}
                          className={`text-xs px-2 py-1 rounded font-semibold transition ${copiedId === url.shortId ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-indigo-500 hover:text-white'}`}
                        >
                          {copiedId === url.shortId ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{url.redirectUrl}</td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {url.visitHistory?.length || url.clicks || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/analytics/${url.shortId}`}
                        className="text-white text-xs font-semibold px-3 py-2 rounded-lg"
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                      >
                        📊 Analytics
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard