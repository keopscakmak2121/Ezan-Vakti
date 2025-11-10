import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import TabBar from './components/TabBar.jsx';
import HomePage from './components/home/HomePage.jsx';
import SurahList from './components/SurahList.jsx';
import QuranReader from './components/QuranReader.jsx';
import Settings from './components/Settings.jsx';
import Navigation, { menuItems } from './components/Navigation.jsx'; // Import menuItems

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [frequentItems, setFrequentItems] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
      return !!settings.darkMode;
    } catch { return false; }
  });

  const [selectedSurah, setSelectedSurah] = useState(null);

  // Add hardware back button listener
  useEffect(() => {
    const listener = CapacitorApp.addListener('backButton', (e) => {
      if (isMenuOpen) {
        e.preventDefault();
        setMenuOpen(false);
      } else if (currentView !== 'home') {
        e.preventDefault();
        setCurrentView('home');
        setSelectedSurah(null);
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      listener.remove();
    };
  }, [currentView, isMenuOpen]);

  // Function to track usage
  const trackUsage = (view) => {
    try {
      const stats = JSON.parse(localStorage.getItem('navigation_stats') || '{}');
      stats[view] = (stats[view] || 0) + 1;
      localStorage.setItem('navigation_stats', JSON.stringify(stats));
      updateFrequentItems(); // Update highlights on the fly
    } catch (e) {
      console.error("Failed to track usage:", e);
    }
  };

  // Function to update frequent items state
  const updateFrequentItems = () => {
    try {
      const stats = JSON.parse(localStorage.getItem('navigation_stats') || '{}');
      const sortedItems = Object.keys(stats)
        .filter(id => id !== 'home' && id !== 'menu') // Exclude non-menu items
        .sort((a, b) => stats[b] - stats[a]);
      setFrequentItems(sortedItems.slice(0, 3)); // Get top 3
    } catch (e) {
      console.error("Failed to update frequent items:", e);
    }
  };

  // Load frequent items on initial render
  useEffect(() => {
    updateFrequentItems();
  }, []);

  const handleNavigate = (view) => {
    if (view === 'menu') {
      setMenuOpen(!isMenuOpen);
    } else {
      trackUsage(view);
      setCurrentView(view);
      setMenuOpen(false);
      if (view !== 'quran') {
        setSelectedSurah(null);
      }
    }
  };

  const handleMenuNavigate = (view) => {
    trackUsage(view);
    setCurrentView(view);
    setMenuOpen(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    // ... (rest of the function is unchanged)
  };

  const bg = darkMode ? '#1f2937' : '#f3f4f6';

  const renderCurrentView = () => {
    // ... (rest of the function is unchanged)
    switch (currentView) {
      case 'home':
        return <HomePage darkMode={darkMode} onNavigate={handleNavigate} />;
      case 'quran':
        return selectedSurah ? 
               <QuranReader surah={selectedSurah} darkMode={darkMode} onBack={() => setSelectedSurah(null)} /> : 
               <SurahList onSurahClick={setSelectedSurah} darkMode={darkMode} />;
      case 'settings':
        return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      default:
        return (
          <div style={{textAlign: 'center', paddingTop: '50px', color: darkMode ? 'white' : 'black'}}>
            <h2>{currentView}</h2>
            <p>Bu sayfa henüz hazır değil.</p>
          </div>
        );
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg }}>
      <h1 style={{color: 'red', textAlign: 'center', position: 'absolute', top: 0, width: '100%', zIndex: 9999}}>TEST GÖRÜNÜYOR MU?</h1>
      {isMenuOpen && <div style={{position:'fixed', top: 0, left:0, right:0, bottom: 0, background:'rgba(0,0,0,0.5)', zIndex: 99}} onClick={() => setMenuOpen(false)}></div>}
      {isMenuOpen && <div style={{position:'fixed', top: '10%', left:10, right:10, zIndex:100}}><Navigation darkMode={darkMode} onNavigate={handleMenuNavigate} currentView={currentView} /></div>}
      
      <div style={{ padding: '10px', paddingBottom: '70px' }}>
        {renderCurrentView()}
      </div>
      
      <TabBar 
        darkMode={darkMode} 
        onNavigate={handleNavigate} 
        currentView={currentView} 
        frequentItems={frequentItems}
        menuItems={menuItems} // Pass the original menu items for icon lookup
      />
    </div>
  );
};

export default App;
