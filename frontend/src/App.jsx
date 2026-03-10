import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import Footer from './Components/Footer';
import Team from './Pages/Team';
import Events from './Pages/Events';
import Gallery from './Pages/Gallery';
import Feedback from './Pages/Feedback';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Apply theme class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-500 bg-white dark:bg-slate-900">
        <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/feedback" element={<Feedback />} />
          {/* Add other routes as we build them */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;