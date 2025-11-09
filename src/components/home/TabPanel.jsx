import React, { useState } from 'react';
import DailyVerseCard from './DailyVerseCard.jsx';
import HadithCard from './HadithCard.jsx';
import EsmaCard from './EsmaCard.jsx';

const TabPanel = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('verse');

  const tabStyles = {
    container: {
      marginTop: '20px',
    },
    tabs: {
      display: 'flex',
      borderBottom: `2px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
      marginBottom: '20px',
    },
    tab: {
      padding: '10px 20px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontWeight: '600',
      fontSize: '16px',
    },
    activeTab: {
      color: darkMode ? '#10b981' : '#059669',
      borderBottom: `2px solid ${darkMode ? '#10b981' : '#059669'}`,
    },
    content: {
      padding: '0',
    },
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'verse':
        return <DailyVerseCard darkMode={darkMode} />;
      case 'hadith':
        return <HadithCard darkMode={darkMode} />;
      case 'esma':
        return <EsmaCard darkMode={darkMode} />;
      default:
        return null;
    }
  };

  return (
    <div style={tabStyles.container}>
      <div style={tabStyles.tabs}>
        <button
          style={{ ...tabStyles.tab, ...(activeTab === 'verse' && tabStyles.activeTab) }}
          onClick={() => setActiveTab('verse')}
        >
          Günün Ayeti
        </button>
        <button
          style={{ ...tabStyles.tab, ...(activeTab === 'hadith' && tabStyles.activeTab) }}
          onClick={() => setActiveTab('hadith')}
        >
          Günün Hadisi
        </button>
        <button
          style={{ ...tabStyles.tab, ...(activeTab === 'esma' && tabStyles.activeTab) }}
          onClick={() => setActiveTab('esma')}
        >
          Günün Esması
        </button>
      </div>
      <div style={tabStyles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default TabPanel;
