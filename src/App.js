import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Designs from './pages/Designs';
import Upload from './pages/Upload';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Community from './pages/Community';
import Profile from './pages/Profile';
import MyDesigns from './pages/MyDesigns';
import DesignDetail from './pages/DesignDetail';
import Guides from './pages/Guides';
import GuideDetail from './pages/GuideDetail';
import CreateGuide from './pages/CreateGuide';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/designs/:id" element={<DesignDetail />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-designs" element={<MyDesigns />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/guides/:id" element={<GuideDetail />} />
            <Route path="/create-guide" element={<CreateGuide />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
