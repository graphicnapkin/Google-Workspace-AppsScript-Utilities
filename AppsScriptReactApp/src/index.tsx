import ReactDOM from 'react-dom'
import React from 'react'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

const app = document.getElementById('app')
ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    app
)
