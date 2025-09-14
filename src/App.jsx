import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Button from './components/Button'
import './App.css'

function App() {

  return (
    <>
      <div>
        <h1>Art Scraper</h1>
      </div>
      <h3>Vite + React</h3>
      <div className="card">
        <a href="pages/account.jsx">
        <button>Click Me</button>
        </a>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Viteaaaaabbbb and React logos to learn more
      </p>
    </>
  )
}

export default App
