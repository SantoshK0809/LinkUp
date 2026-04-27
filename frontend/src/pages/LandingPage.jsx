import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Stats } from '../components/Stats';
import { Footer } from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <>
    {/* <div className='landingPageContainer fixed'>
       <nav className='navbar'>
         <div className="navHeader">
            
            <img src="./logoz.png" alt="logo" />
            <h2><b>ConnectUs</b></h2>
            </div>
         <div className="navlist">
            <p>Join as Guest</p>
            <p>Register</p>
            <div role='button'>
                <p onClick={() => navigate("/login")}>Login</p>
            </div>
         </div>
       </nav>
       <div className='body'>
        <h3>Connect with the world in one click.</h3>
        <p>Secure, fast, and reliable video conferencing</p>
        <img src="https://st1.zoom.us/fe-static/fe-signup-login-active/img/banner-step-1.2faf107a.png" alt="cartoon" />
        
       </div>
    </div> */}

    <Navbar/>
    <Hero/>
    <Features/>
    <HowItWorks/>
    {/* <Stats/> */}
    <Footer/>
    </>
  )
}
