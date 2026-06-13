import { useState } from 'react'
import './App.css'
import { articles } from './data/articles'
import logo from './assets/logo.jpg'

function App() {
  const [selectedArticle, setSelectedArticle] = useState(null)

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
      </aside>

      <main className="main-content">
        <header className="header">
          <img src={logo} alt="Logo Teoria Transpirației" className="logo" />
          <h1>Teoria Transpirației</h1>
        </header>

        <section className="article-detail">
          {selectedArticle ? (
            <>
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
