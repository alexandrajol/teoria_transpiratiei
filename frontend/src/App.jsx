import { useState, useEffect } from 'react'
import './App.css'
import logo from './assets/logo.jpg'

const API_URL = 'http://localhost:3000/api';

function App() {
  const [articles, setArticles] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
