import './index.css'
import React from 'react'
import { render } from 'react-dom'
import { Game } from './components/Game'

render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>,
  document.getElementById('root')
)
