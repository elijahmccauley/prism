"use client";
import React, { useState, useEffect } from 'react';

// --- Type Definitions for TypeScript ---
type Year = 'FR' | 'SO' | 'JR' | 'SR';
type Event = '800' | '1600' | '3200' | '5k';

type Times = {
  [key in Year]: {
    [key in Event]: string;
  };
};

type Prospect = {
  id: number;
  name: string;
  highSchool: string;
  gradYear: number;
  predicted5kTime: string;
  confidence: 'High' | 'Medium' | 'Low';
};

// --- Mock Data for Prospects Page ---
const mockProspects: Prospect[] = [
  { id: 1, name: 'Elijah McCauley', highSchool: 'Paideia, GA', gradYear: 2025, predicted5kTime: '14:28.50', confidence: 'High' },
  { id: 2, name: 'Sam Colton', highSchool: 'Paideia, GA', gradYear: 2025, predicted5kTime: '14:35.11', confidence: 'High' },
  { id: 3, name: 'Kai Komatsu', highSchool: 'Olympia, FL', gradYear: 2026, predicted5kTime: '14:41.92', confidence: 'Medium' },
  { id: 4, name: 'Grant Gaffney', highSchool: 'Marist, GA', gradYear: 2025, predicted5kTime: '14:44.30', confidence: 'High' },
  { id: 5, name: 'Zack Truitt', highSchool: 'Landmark Christian School, GA', gradYear: 2025, predicted5kTime: '14:48.76', confidence: 'Low' },
  { id: 6, name: 'Sohum Gaitonde', highSchool: 'Parsippany Hills, NJ', gradYear: 2026, predicted5kTime: '14:51.05', confidence: 'Medium' },
];

// --- Helper Data ---
const years: Year[] = ['FR', 'SO', 'JR', 'SR'];
const events: Event[] = ['800', '1600', '3200', '5k'];

// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState<'input' | 'prospects'>('input');

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400">PRISM</h1>
          <p className="text-gray-400 mt-2">Predicting the next generation of collegiate running stars.</p>
        </header>

        <nav className="flex justify-center mb-12 bg-gray-800/50 rounded-lg p-2 max-w-sm mx-auto">
          <button
            onClick={() => setPage('input')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-300 ${
              page === 'input' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Predict Times
          </button>
          <button
            onClick={() => setPage('prospects')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-300 ${
              page === 'prospects' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Top Prospects
          </button>
        </nav>

        <main>
          {page === 'input' ? <InputForm /> : <ProspectsList />}
        </main>
      </div>
       <footer className="text-center py-6 text-gray-500 text-xs">
          <p>Created by Elijah McCauley | Data Science & Software Engineering</p>
      </footer>
    </div>
  );
}

// --- Input Form Component ---
function InputForm() {
  const [times, setTimes] = useState<Times>({
    FR: { '800': '', '1600': '', '3200': '', '5k': '' },
    SO: { '800': '', '1600': '', '3200': '', '5k': '' },
    JR: { '800': '', '1600': '', '3200': '', '5k': '' },
    SR: { '800': '', '1600': '', '3200': '', '5k': '' },
  });

  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [year, event] = name.split('-') as [Year, Event];
    setTimes(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [event]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send the 'times' object to your model's API endpoint
    console.log('Submitting data to model:', times);

    setIsLoading(true);
    setPrediction(null);
    setError(null);

    try {
      const response = await fetch(
        'http://localhost:5001/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(times),
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      const predictedSeconds = result.predicted_5k_time_seconds;

      const minutes = Math.floor(predictedSeconds / 60);
      const seconds = (predictedSeconds % 60).toFixed(2).padStart(5, '0');
      setPrediction(`${minutes}:${seconds}`);
      alert('Prediction request sent! (Check console for data)');
    } catch (error) {
      console.error('Error sending prediction request:', error);
      setError('Failed to get a prediction. Please try again later.');
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-cyan-300">Enter High School PRs</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-5 gap-x-4 gap-y-4">
            <div />
            {events.map(event => (
              <div key={event} className="text-center font-semibold text-gray-300 pb-2">
                {event}
              </div>
            ))}
            {years.map(year => (
              <React.Fragment key={year}>
                <div className="flex items-center justify-center font-bold text-gray-300 text-lg">
                  {year}
                </div>
                {events.map(event => (
                  <input
                    key={`${year}-${event}`}
                    type="text"
                    name={`${year}-${event}`}
                    value={times[year][event]}
                    onChange={handleChange}
                    placeholder="m:ss.ms"
                    className="w-full bg-gray-700 border-2 border-gray-600 text-white text-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Predicting...' : 'Predict Collegiate 5k Time'}
            </button>
          </div>
        </form>
      </div>
      
      {/* --- NEW: Conditional rendering for results --- */}
      <div className="mt-8 text-center">
        {isLoading && (
            <div className="text-cyan-400">Loading prediction...</div>
        )}
        {error && (
            <div className="bg-red-500/20 text-red-300 p-4 rounded-lg max-w-md mx-auto">{error}</div>
        )}
        {prediction && (
           <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
             <div className="p-6">
                 <p className="text-sm text-gray-400">Predicted Collegiate 5k Time</p>
                 <p className="text-5xl font-mono font-bold text-cyan-400 tracking-wider mt-2">{prediction}</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

// --- Prospects List Component ---
function ProspectsList() {
    const getConfidenceColor = (confidence: 'High' | 'Medium' | 'Low') => {
        switch (confidence) {
            case 'High': return 'bg-green-500/20 text-green-300';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-300';
            case 'Low': return 'bg-red-500/20 text-red-300';
        }
    }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center text-cyan-300">Top Recruiting Prospects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProspects.map(prospect => (
          <div key={prospect.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-cyan-500/20 hover:scale-[1.02]">
            <div className="p-6">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-cyan-400 font-semibold">{prospect.highSchool}</p>
                    <h3 className="text-xl font-bold text-white mt-1">{prospect.name}</h3>
                  </div>
                   <div className={`text-xs font-bold px-2 py-1 rounded-full ${getConfidenceColor(prospect.confidence)}`}>
                        {prospect.confidence}
                    </div>
              </div>
              <div className="mt-6 text-center bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Predicted Collegiate 5k</p>
                <p className="text-4xl font-mono font-bold text-cyan-400 tracking-wider mt-1">{prospect.predicted5kTime}</p>
              </div>
               <p className="text-center text-xs text-gray-500 mt-4">Class of {prospect.gradYear}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
