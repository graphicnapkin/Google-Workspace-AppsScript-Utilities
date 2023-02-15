import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import About from './components/About'
import Home from './components/Home'
import Nav from './components/Nav'

function App() {
    let [first, setFirst] = useState<number | undefined>(4)
    // you would think this stores a string but NOPE
    // it stores the result of the Apps Script function
    // being called.
    // I think whats happening here contents in between <? ?>
    // is only being evaluated during the first render from
    // doGet function, which means you won't be able to dynamically
    // interact with them. I think the only really solution would be to
    // move your apps script 'api' endpoints into a new script and
    // deploy them as a API executable. You can use the getToken pattern
    // below to call this API executable inside the react app.
    const addNumberString = '<?= addNumbers(9) ?>'
    console.log('welp', addNumberString)

    // fetch / useEffect works as expected
    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/todos/2')
            .then((response) => response.json())
            .then((json) => console.log(json))
    }, [])

    const oAuthToken = '<?= getToken() ?>'
    return (
        <>
            <Nav />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="*" element={<Home />} />
            </Routes>
            <p>Current User: {'<?= getPerson() ?>'}</p>
            <p>Token: {oAuthToken}</p>
            <p>Effective User: {'<?= getSessionUser() ?>'}</p>
            <input
                value={first}
                type="input"
                onChange={(e) => setFirst(parseInt(e.target.value))}
            />
            {/* This does not work, will get NaN */}
            <p>
                Use Arguments from State Inline:{' '}
                {'<?= addNumbers(' + first + ') ?>'}
            </p>
            {/* This WILL work */}
            <p>
                Use Arguments statically set in react: {'<?= addNumbers(9) ?>'}
            </p>
        </>
    )
}

export default App
