import React, { useState, useEffect } from 'react';

const FocusFlowDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0); // in seconds
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [timerSubject, setTimerSubject] = useState('');
  const [suggestedDuration, setSuggestedDuration] = useState(0); // in minutes
  const [earnedStars, setEarnedStars] = useState(0); // stars earned in current session
  
  const [userStats, setUserStats] = useState({
    hoursStudied: 23.5,
    weeklyGoal: 30,
    rewardsEarned: 470,
    completionRate: 78
  });
  
  const rewards = [
    { id: 1, name: '$5 Amazon Gift Card', stars: 500, image: 'gift-card' },
    { id: 2, name: '$10 Spotify Premium', stars: 1000, image: 'music' },
    { id: 3, name: '$15 Netflix Subscription', stars: 1500, image: 'movie' }
  ];
  
  useEffect(() => {
    let interval;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);
  
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const formatTimeHours = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (timerDuration === 0) return 0;
    return ((timerDuration - timeRemaining) / timerDuration) * 100;
  };
  
  // Handle timer complete
  const handleTimerComplete = () => {
    setTimerActive(false);
    
    // Calculate stars earned (10 stars per hour)
    const hoursStudied = timerDuration / 3600;
    const starsEarned = Math.round(hoursStudied * 10);
    
    // Update statistics
    setUserStats(prev => ({
      ...prev,
      hoursStudied: prev.hoursStudied + hoursStudied,
      rewardsEarned: prev.rewardsEarned + starsEarned
    }));
    
    alert(`Congratulations! You've completed your ${timerDuration / 60} minute study session and earned ${starsEarned} stars!`);
  };
  
  const handleEmergencyStop = () => {
    const timeElapsed = timerDuration - timeRemaining;
    const hoursStudied = timeElapsed / 3600;
    const starsEarned = Math.round(hoursStudied * 10);
    
    setUserStats(prev => ({
      ...prev,
      hoursStudied: prev.hoursStudied + hoursStudied,
      rewardsEarned: prev.rewardsEarned + starsEarned
    }));
    
    setTimerActive(false);
    setTimeRemaining(0);
    setEarnedStars(0);
    
    // Show emergency stop message
    if (timeElapsed > 60) { 
      alert(`Session stopped. You studied for ${formatTimeHours(timeElapsed)} and earned ${starsEarned} stars.`);
    }
  };
  
  // Start timer function
  const startTimer = (minutes, subject = 'Study Session') => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeRemaining(seconds);
    setTimerSubject(subject);
    setTimerActive(true);
    setEarnedStars(0);
  };
  
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    setChatHistory([...chatHistory, { sender: 'user', text: userInput }]);
    
    if (suggestedDuration > 0 && userInput.toLowerCase().includes('start')) {
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          sender: 'ai', 
          text: `Starting your ${suggestedDuration}-minute timer for ${timerSubject}. Good luck!` 
        }]);
        
        startTimer(suggestedDuration, timerSubject);
      }, 500);
      
      setSuggestedDuration(0);
      setUserInput('');
      return;
    }
    
    // Generate AI response with timer suggestion
    setTimeout(() => {
      let response = '';
      let duration = 0;
      let subject = '';
      const input = userInput.toLowerCase();
      
      if (input.includes('math') || input.includes('calculus')) {
        duration = 45;
        subject = 'Mathematics';
        response = `I recommend a ${duration}-minute focused study session for your math work. Type "start" to begin the timer.`;
      } else if (input.includes('reading') || input.includes('literature')) {
        duration = 30;
        subject = 'Reading';
        response = `For reading comprehension, I suggest a ${duration}-minute session. Type "start" to begin.`;
      } else if (input.includes('code') || input.includes('programming')) {
        duration = 25;
        subject = 'Programming';
        response = `For programming, I recommend a ${duration}-minute focus session. Type "start" to begin.`;
      } else {
        duration = 40;
        subject = 'Study Session';
        response = `I've set up a ${duration}-minute timer for your study session. Type "start" to begin.`;
      }
      
      setChatHistory(prev => [...prev, { sender: 'ai', text: response }]);
      setSuggestedDuration(duration);
      setTimerSubject(subject);
    }, 500);
    
    // Clear input field
    setUserInput('');
  };
  
  // Calculate progress percentage for dashboard
  const progressPercentage = (userStats.hoursStudied / userStats.weeklyGoal) * 100;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header - Always visible */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FocusFlow.AI</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="bg-yellow-400 text-blue-800 p-1 rounded flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 font-medium">{userStats.rewardsEarned}</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
              JS
            </div>
          </div>
        </div>
      </header>
      
      {/* Timer View (when active) */}
      {timerActive ? (
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-900 text-white p-6">
          <div className="text-center max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">{timerSubject}</h2>
            <p className="text-gray-400 mb-8">Stay focused and minimize distractions</p>
            
            {/* Large timer display */}
            <div className="text-6xl font-bold mb-6">{formatTime(timeRemaining)}</div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className="bg-blue-500 h-4 rounded-full transition-all duration-1000 ease-linear" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            
            {/* Timer stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div>
                <p className="text-gray-400 text-sm">Elapsed</p>
                <p className="text-xl font-medium">{formatTime(timerDuration - timeRemaining)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Remaining</p>
                <p className="text-xl font-medium">{formatTime(timeRemaining)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Stars</p>
                <p className="text-xl font-medium text-yellow-400">
                  +{Math.round(((timerDuration - timeRemaining) / 3600) * 10)}
                </p>
              </div>
            </div>
            
            {/* Emergency stop button */}
            <button 
              onClick={handleEmergencyStop}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg w-full transition"
            >
              Emergency Stop
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation Tabs - Only visible when timer is not active */}
          <nav className="bg-white shadow">
            <div className="container mx-auto">
              <div className="flex">
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className={`px-6 py-4 font-medium ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('ai')} 
                  className={`px-6 py-4 font-medium ${activeTab === 'ai' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                  AI Focus Assistant
                </button>
                <button 
                  onClick={() => setActiveTab('rewards')} 
                  className={`px-6 py-4 font-medium ${activeTab === 'rewards' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                  Rewards
                </button>
              </div>
            </div>
          </nav>
          
          {/* Main Content - Only visible when timer is not active */}
          <main className="flex-grow container mx-auto p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Your Study Progress</h2>
                
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-600 font-medium">Hours Studied</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">This Week</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{userStats.hoursStudied.toFixed(1)}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{progressPercentage.toFixed(0)}% of weekly goal</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-600 font-medium">Weekly Goal</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Target</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{userStats.weeklyGoal} hrs</p>
                    <p className="text-sm text-gray-600 mt-4">
                      {userStats.weeklyGoal - userStats.hoursStudied > 0 
                        ? `${(userStats.weeklyGoal - userStats.hoursStudied).toFixed(1)} hours remaining` 
                        : 'Goal achieved!'}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-600 font-medium">Rewards Earned</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Stars</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{userStats.rewardsEarned}</p>
                    <p className="text-sm text-gray-600 mt-4">Next reward at 500 stars</p>
                  </div>
                </div>
                
                {/* Quick Start Timers */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Start Timers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                      onClick={() => startTimer(25, 'Pomodoro Session')}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 transition flex flex-col items-center justify-center"
                    >
                      <span className="text-xl font-bold">25 min</span>
                      <span className="text-sm mt-1">Pomodoro</span>
                    </button>
                    <button 
                      onClick={() => startTimer(45, 'Deep Focus Session')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 transition flex flex-col items-center justify-center"
                    >
                      <span className="text-xl font-bold">45 min</span>
                      <span className="text-sm mt-1">Deep Focus</span>
                    </button>
                    <button 
                      onClick={() => startTimer(15, 'Quick Focus Session')}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 transition flex flex-col items-center justify-center"
                    >
                      <span className="text-xl font-bold">15 min</span>
                      <span className="text-sm mt-1">Quick Focus</span>
                    </button>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Study Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">Math - Calculus</p>
                        <p className="text-sm text-gray-600">Yesterday, 3:30 PM</p>
                      </div>
                      <span className="font-medium">1.5 hrs</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">Programming - React</p>
                        <p className="text-sm text-gray-600">Yesterday, 10:15 AM</p>
                      </div>
                      <span className="font-medium">2 hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Literature Review</p>
                        <p className="text-sm text-gray-600">Mar 6, 7:00 PM</p>
                      </div>
                      <span className="font-medium">1 hr</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Focus Assistant Tab */}
            {activeTab === 'ai' && (
              <div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Focus Assistant</h2>
                  <p className="text-gray-600 mb-6">
                    Tell me what you're studying, and I'll suggest the ideal focus timer for you.
                  </p>
                  
                  {/* Chat History */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-gray-400 py-10">
                        <p>Start a conversation with the AI assistant</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatHistory.map((message, index) => (
                          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div 
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender === 'user' 
                                  ? 'bg-blue-600 text-white rounded-br-none' 
                                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              {message.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <form onSubmit={handleChatSubmit} className="flex">
                    <input 
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={suggestedDuration > 0 ? 'Type "start" to begin your timer...' : 'e.g., I need to study calculus for 2 hours'}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </form>
                </div>
                
                {/* Suggested Focus Techniques */}
                <div className="bg-white rounded-lg shadow p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Focus Techniques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Pomodoro Technique</h4>
                      <p className="text-sm text-gray-600">25 minutes of focused work followed by a 5-minute break</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Deep Work</h4>
                      <p className="text-sm text-gray-600">90-minute sessions of intense focus without distractions</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Time Blocking</h4>
                      <p className="text-sm text-gray-600">Schedule specific blocks of time for different subjects</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Rewards Store</h2>
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-medium">{userStats.rewardsEarned} stars available</span>
                    </div>
                  </div>
                  
                  {/* Rewards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rewards.map(reward => (
                      <div key={reward.id} className="border rounded-lg overflow-hidden">
                        <div className="h-40 bg-gray-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {reward.image === 'gift-card' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            )}
                            {reward.image === 'music' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            )}
                            {reward.image === 'movie' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            )}
                          </svg>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium mb-2">{reward.name}</h3>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-yellow-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{reward.stars}</span>
                            </div>
                            <button 
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                userStats.rewardsEarned >= reward.stars 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Redeem
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/*How to Earn*/}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Earn Stars</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2">Study Time</div>
                    <p className="text-sm text-gray-600">Earn 10 stars for every hour of focused study time</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2">Goal Completion</div>
                    <p className="text-sm text-gray-600">Earn 50 bonus stars when you reach your weekly goal</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2">Consistency Streak</div>
                    <p className="text-sm text-gray-600">Earn 100 stars for studying 5 days in a row</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-4">
          <div className="container mx-auto">
            <p>&copy; 2022 FocusFlow.AI. All rights reserved.</p>
          </div>
                </footer>
                </>
              )}
            </div>
          );
        };
        
        export default FocusFlowDashboard;
   

    

                










