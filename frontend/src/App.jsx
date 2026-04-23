import { useState } from 'react'
import './App.css'
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import { RegisterPage } from './pages/RegisterPage'
import { LoginPage } from './pages/LoginPage'

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage/>} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/register' element={<RegisterPage/>} />
      </Routes>
    </Router>
  )
}

export default App
