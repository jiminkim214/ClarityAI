import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { ChatInterface } from './components/ChatInterface';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [currentSection, setCurrentSection] = useState<'home' | 'chat'>('home');

  const renderSection = () => {
    switch (currentSection) {
      case 'chat':
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-indigo-950">
            <Navigation 
              currentSection={currentSection} 
              setCurrentSection={setCurrentSection}
            />
            <div className="container mx-auto px-6 pt-32 pb-8">
              <div className="max-w-4xl mx-auto">
                <ChatInterface />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <HomePage 
              currentSection={currentSection}
              setCurrentSection={setCurrentSection}
            />
            <Footer />
          </>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen">{renderSection()}</div>
    </AuthProvider>
  );
}

export default App;