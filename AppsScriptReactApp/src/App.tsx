import React from 'react'
import { Routes, Route } from 'react-router-dom'
import About from './components/About'
import Home from './components/Home'
import Nav from './components/Nav'

function App() {
    return (
        <>
            <Nav />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="about" element={<About />} />
                {/* <Route path="*" element={<Home />} /> */}
            </Routes>
        </>
    )
}

export default App
