import { useState, useEffect } from 'react';
import './StatisticsDashboard.css';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const COLORS = {
  like: '#4CAF50',
  dislike: '#f44336',
  primary: '#CB769E',
  secondary: '#011F28',
  background: '#F5F5F4'
};

function StatisticsDashboard({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/statistics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculatePercentage = (likes, dislikes) => {
    const total = likes + dislikes;
    if (total === 0) return 0;
    return ((likes / total) * 100).toFixed(1);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{payload[0].name}</p>
          <p className="value" style={{ color: payload[0].fill }}>
            {payload[0].value} ({((payload[0].value / (payload[0].payload.likes + payload[0].payload.dislikes)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="statistics-dashboard">
        <div className="stats-header">
          <h2>Statistics Dashboard</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="loading">
          <div className="loader"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="statistics-dashboard">
        <div className="stats-header">
          <h2>Statistics Dashboard</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="error">Failed to load statistics</div>
      </div>
    );
  }

  // Prepare data for charts
  const reactionPieData = [
    { name: 'Likes', value: stats.overview.totalLikes, color: COLORS.like },
    { name: 'Dislikes', value: stats.overview.totalDislikes, color: COLORS.dislike }
  ];

  const categoryBarData = stats.categoryStats.map(cat => ({
    name: cat.category.length > 10 ? cat.category.substring(0, 10) + '...' : cat.category,
    fullName: cat.category,
    Likes: cat.likes,
    Dislikes: cat.dislikes,
    Total: cat.total_reactions
  }));

  const engagementData = stats.mostEngaging.slice(0, 5).map(article => ({
    name: article.title.length > 20 ? article.title.substring(0, 20) + '...' : article.title,
    fullTitle: article.title,
    Likes: article.likes,
    Dislikes: article.dislikes
  }));

  const topArticlesData = stats.mostLiked.slice(0, 6).map((article, index) => ({
    name: `#${index + 1}`,
    fullTitle: article.title,
    'Likes': article.likes,
    'Total Reactions': article.total_reactions
  }));

  // Sentiment comparison data
  const sentimentData = [
    {
      name: 'Positive',
      value: stats.overview.totalLikes,
      percentage: ((stats.overview.totalLikes / (stats.overview.totalLikes + stats.overview.totalDislikes)) * 100).toFixed(1)
    },
    {
      name: 'Negative',
      value: stats.overview.totalDislikes,
      percentage: ((stats.overview.totalDislikes / (stats.overview.totalLikes + stats.overview.totalDislikes)) * 100).toFixed(1)
    }
  ];

  return (
    <div className="statistics-dashboard">
      <div className="stats-header">
        <h2>Statistics Dashboard</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      {/* Overview Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.overview.totalArticles}</h3>
            <p>Published Articles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.overview.totalReactions}</h3>
            <p>Total Reactions</p>
          </div>
        </div>
        <div className="stat-card like-card">
          <div className="stat-content">
            <h3>{stats.overview.totalLikes}</h3>
            <p>Total Likes</p>
          </div>
        </div>
        <div className="stat-card dislike-card">
          <div className="stat-content">
            <h3>{stats.overview.totalDislikes}</h3>
            <p>Total Dislikes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.overview.engagementRate}%</h3>
            <p>Engagement Rate</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="stats-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          Most Liked
        </button>
        <button
          className={`tab-btn ${activeTab === 'disliked' ? 'active' : ''}`}
          onClick={() => setActiveTab('disliked')}
        >
          Most Disliked
        </button>
        <button
          className={`tab-btn ${activeTab === 'engaging' ? 'active' : ''}`}
          onClick={() => setActiveTab('engaging')}
        >
          Most Engaging
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          By Category
        </button>
      </div>

      {/* Tab Content */}
      <div className="stats-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="charts-grid">
              {/* Pie Chart - Reaction Distribution */}
              <div className="chart-card">
                <h3>Reaction Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reactionPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reactionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: COLORS.like }}></span>
                    <span>Likes: {stats.overview.totalLikes}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: COLORS.dislike }}></span>
                    <span>Dislikes: {stats.overview.totalDislikes}</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart - Top 5 Engaging Articles */}
              <div className="chart-card">
                <h3>Top 5 Engaging Articles</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Likes" fill={COLORS.like} />
                    <Bar dataKey="Dislikes" fill={COLORS.dislike} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Stats */}
              <div className="chart-card stats-summary">
                <h3>Engagement Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <div className="summary-content">
                      <h4>{stats.overview.articlesWithReactions}</h4>
                      <p>Articles with Reactions</p>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-content">
                      <h4>{stats.overview.engagementRate}%</h4>
                      <p>Engagement Rate</p>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-content">
                      <h4>{stats.overview.totalReactions}</h4>
                      <p>Total Interactions</p>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-content">
                      <h4>{((stats.overview.totalLikes / (stats.overview.totalLikes + stats.overview.totalDislikes)) * 100).toFixed(1)}%</h4>
                      <p>Positive Sentiment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment Bar Chart */}
              <div className="chart-card">
                <h3>Overall Sentiment Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sentimentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p className="label" style={{ fontWeight: 'bold' }}>
                              {payload[0].payload.name} Reactions
                            </p>
                            <p style={{ color: payload[0].fill, fontWeight: 'bold' }}>
                              {payload[0].value} ({payload[0].payload.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                      <Cell fill={COLORS.like} />
                      <Cell fill={COLORS.dislike} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="sentiment-labels">
                  <div className="sentiment-positive">
                    <span className="sentiment-text">
                      {sentimentData[0].percentage}% Positive
                    </span>
                  </div>
                  <div className="sentiment-negative">
                    <span className="sentiment-text">
                      {sentimentData[1].percentage}% Negative
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Chart - Top Articles Trend */}
              {topArticlesData.length > 0 && (
                <div className="chart-card">
                  <h3>Top 6 Articles Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={topArticlesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="custom-tooltip">
                              <p className="label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                {payload[0].payload.fullTitle.substring(0, 50)}...
                              </p>
                              {payload.map((entry, index) => (
                                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                                  {entry.name}: {entry.value}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Legend />
                      <Line type="monotone" dataKey="Likes" stroke={COLORS.like} strokeWidth={3} dot={{ fill: COLORS.like, r: 6 }} />
                      <Line type="monotone" dataKey="Total Reactions" stroke={COLORS.primary} strokeWidth={3} dot={{ fill: COLORS.primary, r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="article-list-stats">
            <h3>Most Liked Articles</h3>
            {stats.mostLiked.length === 0 ? (
              <p className="no-data">No articles with likes yet</p>
            ) : (
              <>
                <div className="chart-card" style={{ marginBottom: '20px' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.mostLiked.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="likes" fill={COLORS.like} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Likes</th>
                      <th>Dislikes</th>
                      <th>Ratio</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mostLiked.map((article, index) => (
                      <tr key={article.id}>
                        <td className="rank">#{index + 1}</td>
                        <td className="article-title" title={article.title}>{article.title}</td>
                        <td>{article.author}</td>
                        <td><span className="category-badge">{article.category}</span></td>
                        <td className="likes-count">{article.likes}</td>
                        <td className="dislikes-count">{article.dislikes}</td>
                        <td>
                          <div className="ratio-bar">
                            <div
                              className="ratio-bar-fill"
                              style={{
                                width: `${calculatePercentage(article.likes, article.dislikes)}%`
                              }}
                            ></div>
                            <span className="ratio-text">
                              {calculatePercentage(article.likes, article.dislikes)}%
                            </span>
                          </div>
                        </td>
                        <td>{formatDate(article.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {activeTab === 'disliked' && (
          <div className="article-list-stats">
            <h3>Most Disliked Articles</h3>
            {stats.mostDisliked.length === 0 ? (
              <p className="no-data">No articles with dislikes yet</p>
            ) : (
              <>
                <div className="chart-card" style={{ marginBottom: '20px' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.mostDisliked.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="dislikes" fill={COLORS.dislike} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Likes</th>
                      <th>Dislikes</th>
                      <th>Ratio</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mostDisliked.map((article, index) => (
                      <tr key={article.id}>
                        <td className="rank">#{index + 1}</td>
                        <td className="article-title" title={article.title}>{article.title}</td>
                        <td>{article.author}</td>
                        <td><span className="category-badge">{article.category}</span></td>
                        <td className="likes-count">{article.likes}</td>
                        <td className="dislikes-count">{article.dislikes}</td>
                        <td>
                          <div className="ratio-bar">
                            <div
                              className="ratio-bar-fill"
                              style={{
                                width: `${calculatePercentage(article.likes, article.dislikes)}%`
                              }}
                            ></div>
                            <span className="ratio-text">
                              {calculatePercentage(article.likes, article.dislikes)}%
                            </span>
                          </div>
                        </td>
                        <td>{formatDate(article.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {activeTab === 'engaging' && (
          <div className="article-list-stats">
            <h3>Most Engaging Articles</h3>
            {stats.mostEngaging.length === 0 ? (
              <p className="no-data">No articles with reactions yet</p>
            ) : (
              <>
                <div className="chart-card" style={{ marginBottom: '20px' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.mostEngaging.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="likes" stackId="a" fill={COLORS.like} />
                      <Bar dataKey="dislikes" stackId="a" fill={COLORS.dislike} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Likes</th>
                      <th>Dislikes</th>
                      <th>Total Reactions</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mostEngaging.map((article, index) => (
                      <tr key={article.id}>
                        <td className="rank">#{index + 1}</td>
                        <td className="article-title" title={article.title}>{article.title}</td>
                        <td>{article.author}</td>
                        <td><span className="category-badge">{article.category}</span></td>
                        <td className="likes-count">{article.likes}</td>
                        <td className="dislikes-count">{article.dislikes}</td>
                        <td className="total-reactions">{article.total_reactions}</td>
                        <td>{formatDate(article.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="category-stats">
            <h3>Statistics by Category</h3>
            {stats.categoryStats.length === 0 ? (
              <p className="no-data">No category data available</p>
            ) : (
              <>
                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Reactions by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Likes" fill={COLORS.like} />
                        <Bar dataKey="Dislikes" fill={COLORS.dislike} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Total Reactions per Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryBarData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="Total"
                        >
                          {categoryBarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 360 / categoryBarData.length}, 70%, 60%)`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <table className="stats-table" style={{ marginTop: '20px' }}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Articles</th>
                      <th>Likes</th>
                      <th>Dislikes</th>
                      <th>Total Reactions</th>
                      <th>Avg Reactions/Article</th>
                      <th>Positive Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.categoryStats.map((cat, index) => (
                      <tr key={index}>
                        <td><span className="category-badge">{cat.category}</span></td>
                        <td>{cat.article_count}</td>
                        <td className="likes-count">{cat.likes}</td>
                        <td className="dislikes-count">{cat.dislikes}</td>
                        <td className="total-reactions">{cat.total_reactions}</td>
                        <td>{(cat.total_reactions / cat.article_count).toFixed(2)}</td>
                        <td>
                          <div className="ratio-bar">
                            <div
                              className="ratio-bar-fill"
                              style={{
                                width: `${calculatePercentage(cat.likes, cat.dislikes)}%`
                              }}
                            ></div>
                            <span className="ratio-text">
                              {calculatePercentage(cat.likes, cat.dislikes)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatisticsDashboard;
