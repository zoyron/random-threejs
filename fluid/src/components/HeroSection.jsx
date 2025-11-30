import React, { useState } from "react";
import ThreeJSFluid from "./ThreeJSFluid";
import "./HeroSection.css";

const HeroSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    // Handle email submission logic here
  };

  return (
    <div className="hero-container">
      {/* Three.js Fluid Background */}
      <ThreeJSFluid className="fluid-background" />

      {/* Content Overlay */}
      <div className="hero-content">
        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-logo">
            <div className="logo-icon"></div>
            <span className="logo-text">Sarlloc Labs</span>
          </div>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#solution">Solution</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
          </div>

          <div className="nav-buttons">
            <button className="btn-login">Login</button>
            <button className="btn-signup">Sign Up</button>
          </div>
        </nav>

        {/* Hero Content */}
        <main className="hero-main">
          <h1 className="hero-title">
            Something amazing
            <br />
            is coming soon
          </h1>

          <p className="hero-subtitle">
            Be the first to experience our revolutionary platform. Join our exclusive waitlist and
            get early access.
          </p>

          {/* Email Form */}
          <form className="email-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <svg
                className="mail-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M2 7L12 13L22 7" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                type="email"
                placeholder="Your mail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-submit">
                Get Started
              </button>
            </div>
          </form>

          <p className="privacy-note">No spam, ever. Unsubscribe at any time.</p>
        </main>
      </div>
    </div>
  );
};

export default HeroSection;
