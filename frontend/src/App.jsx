import { useState, useEffect } from 'react'
import './App.css'
import logo from './assets/logo.jpg'
import Login from './components/Login'
import Register from './components/Register'
import EditorDashboard from './components/EditorDashboard'
import JournalistDashboard from './components/JournalistDashboard'
import PublicComments from './components/PublicComments'
import API_URL from './utils/api';

function App() {
  const [articles, setArticles] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authView, setAuthView] = useState(null) // null means show articles, 'login' or 'register' shows auth forms
  const [reactionCounts, setReactionCounts] = useState({})
  const [userReaction, setUserReaction] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  useEffect(() => {
    // Load articles for everyone (authenticated or not)
    fetch(`${API_URL}/articles`)
      .then(res => res.json())
      .then(data => {
        setArticles(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching articles:', error)
        setLoading(false)
      })
  }, [])

  // Fetch reaction counts and user reaction when article is selected
  useEffect(() => {
    if (selectedArticle) {
      // Fetch reaction counts
      fetch(`${API_URL}/reactions/${selectedArticle.id}`)
        .then(res => res.json())
        .then(data => {
          setReactionCounts(data)
        })
        .catch(error => {
          console.error('Error fetching reaction counts:', error)
        })

      // Fetch user's reaction if authenticated
      const token = localStorage.getItem('token')
      if (token) {
        fetch(`${API_URL}/reactions/${selectedArticle.id}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            setUserReaction(data.reaction)
          })
          .catch(error => {
            console.error('Error fetching user reaction:', error)
          })
      }
    }
  }, [selectedArticle])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleRegister = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setArticles([])
    setSelectedArticle(null)
    setReactionCounts({})
    setUserReaction(null)
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: '#ff4444',
      editor: '#ffbb33',
      journalist: '#3399ff',
      viewer: '#44cc44'
    }
    return colors[role] || '#999'
  }

  const handleReaction = async (reaction) => {
    if (!selectedArticle) return

    const token = localStorage.getItem('token')
    if (!token) {
      alert('You must be logged in to react to articles')
      return
    }

    try {
      // If clicking the same reaction, remove it
      if (userReaction === reaction) {
        const response = await fetch(`${API_URL}/reactions/${selectedArticle.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to remove reaction')
        }

        const data = await response.json()
        setReactionCounts(data.counts)
        setUserReaction(null)
      } else {
        // Add or update reaction
        const response = await fetch(`${API_URL}/reactions/${selectedArticle.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reaction })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save reaction')
        }

        const data = await response.json()
        setReactionCounts(data.counts)
        setUserReaction(data.userReaction)
      }
    } catch (error) {
      console.error('Error reacting to article:', error)
      alert(`Failed to save reaction: ${error.message}`)
    }
  }

  // Show Editor Dashboard for editors and admins
  if (user && (user.role === 'editor' || user.role === 'admin')) {
    return <EditorDashboard user={user} onLogout={handleLogout} />
  }

  // Show Journalist Dashboard for journalists
  if (user && user.role === 'journalist') {
    return <JournalistDashboard user={user} onLogout={handleLogout} />
  }

  // Show login/register if user clicked on auth buttons
  if (!user && (authView === 'login' || authView === 'register')) {
    if (authView === 'login') {
      return <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} />
    } else {
      return <Register onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />
    }
  }

  // Show public article viewer for everyone (authenticated viewers and guests)
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Articole</h2>
        {loading ? (
          <div className="loading">Se încarcă...</div>
        ) : (
          <ul className="article-list">
            {articles.map((article) => (
              <li
                key={article.id}
                className={`article-item ${selectedArticle?.id === article.id ? 'active' : ''}`}
                onClick={() => setSelectedArticle(article)}
              >
                <h3>{article.title}</h3>
                <p className="article-date">{formatDate(article.date)}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="main-content">
        <header className="header">
          <img src={logo} alt="Logo Teoria Transpirației" className="logo" />
          <h1>Teoria Transpirației</h1>
          <div className="user-info">
            {user ? (
              <>
                <span className="username">{user.username}</span>
                <span
                  className="role-badge"
                  style={{ backgroundColor: getRoleColor(user.role) }}
                >
                  {user.role.toUpperCase()}
                </span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setAuthView('login')} className="login-button">
                  Login
                </button>
                <button onClick={() => setAuthView('register')} className="register-button">
                  Register
                </button>
              </>
            )}
          </div>
        </header>

        <section className="article-detail">
          {selectedArticle ? (
            <>
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="article-image"
              />
              <h2>{selectedArticle.title}</h2>
              <div className="article-meta">
                <span className="article-author">{selectedArticle.author}</span> • {formatDate(selectedArticle.date)} • {selectedArticle.category}
              </div>
              <div className="article-content">
                {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="article-reactions">
                {user ? (
                  <>
                    <button
                      className={`reaction-button ${userReaction === 'like' ? 'active-like' : ''}`}
                      onClick={() => handleReaction('like')}
                      title="Like this article"
                    >
                      👍 <span>{reactionCounts.likes || 0}</span>
                    </button>
                    <button
                      className={`reaction-button ${userReaction === 'dislike' ? 'active-dislike' : ''}`}
                      onClick={() => handleReaction('dislike')}
                      title="Dislike this article"
                    >
                      👎 <span>{reactionCounts.dislikes || 0}</span>
                    </button>
                  </>
                ) : (
                  <div className="login-prompt">
                    <div className="reaction-stats">
                      <span className="stat-item">
                        👍 <strong>{reactionCounts.likes || 0}</strong> Likes
                      </span>
                      <span className="stat-item">
                        👎 <strong>{reactionCounts.dislikes || 0}</strong> Dislikes
                      </span>
                    </div>
                    <p className="prompt-message">
                      <button onClick={() => setAuthView('login')} className="inline-login-button">
                        Login
                      </button>
                      {' '}sau{' '}
                      <button onClick={() => setAuthView('register')} className="inline-register-button">
                        Register
                      </button>
                      {' '}pentru a reacționa la acest articol
                    </p>
                  </div>
                )}
              </div>

              {/* Public Comments Section - Only for authenticated users */}
              <PublicComments articleId={selectedArticle.id} user={user} />
            </>
          ) : (
            <div className="no-selection">
              Selectează un articol pentru a-l citi
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
