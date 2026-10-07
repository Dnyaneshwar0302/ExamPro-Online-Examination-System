import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Analytics() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/student/results', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return '#27ae60';
    if (percentage >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>📊 Results & Analytics</h2>
        <button onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </button>
      </nav>
      
      <div className="results-container">
        <h2>My Exam Results</h2>
        
        {loading ? (
          <p>Loading results...</p>
        ) : results.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <p style={{ fontSize: '18px', color: '#666' }}>
              No exam results available yet.
            </p>
          </div>
        ) : (
          results.map(result => (
            <div 
              key={result.id} 
              className={`result-card ${result.passed ? 'passed' : 'failed'}`}
            >
              <h3>📝 {result.exam?.title || 'Exam'}</h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '15px',
                marginTop: '15px'
              }}>
                <div>
                  <p><strong>Score:</strong> {result.marksObtained}/{result.totalMarks}</p>
                  <p><strong>Percentage:</strong> 
                    <span style={{ 
                      color: getGradeColor(result.percentage),
                      fontWeight: 'bold',
                      fontSize: '18px',
                      marginLeft: '5px'
                    }}>
                      {result.percentage?.toFixed(2)}%
                    </span>
                  </p>
                </div>
                <div>
                  <p><strong>Status:</strong> 
                    <span style={{
                      color: result.passed ? '#27ae60' : '#e74c3c',
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {result.passed ? '✅ PASSED' : '❌ FAILED'}
                    </span>
                  </p>
                  <p><strong>Time Taken:</strong> {Math.floor(result.timeTakenSeconds / 60)} mins</p>
                </div>
              </div>
              
              {result.cheatingAttempts > 0 && (
                <p style={{ color: '#e74c3c', marginTop: '10px', fontSize: '13px' }}>
                  ⚠ Cheating attempts detected: {result.cheatingAttempts}
                </p>
              )}
              
              <p style={{ color: '#999', fontSize: '12px', marginTop: '10px' }}>
                Submitted: {new Date(result.submissionTime).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Analytics;