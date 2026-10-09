import React, { useCallback, useEffect, useMemo, useState } from 'react';

import axios from 'axios';

import './Results.css';



function Results({ onBack }) {

  const [results, setResults] = useState([]);

  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [examFilter, setExamFilter] = useState('ALL');

  const [statusFilter, setStatusFilter] = useState('ALL');



  const loadResults = useCallback(async () => {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`
    };

    try {

      setLoading(true);



      const [resultsResponse, examsResponse] = await Promise.all([

        axios.get('http://localhost:8080/api/admin/results', { headers }),

        axios.get('http://localhost:8080/api/admin/exams', { headers })

      ]);



      setResults(

        Array.isArray(resultsResponse.data)

          ? resultsResponse.data

          : []

      );



      setExams(

        Array.isArray(examsResponse.data)

          ? examsResponse.data

          : []

      );

    } catch (error) {

      console.error('Error loading results:', error);



      alert(

        'Unable to load results: ' +

          (error.response?.data?.error || error.message)

      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const passedCount = results.filter(

    (result) => result.passed === true

  ).length;



  const failedCount = results.length - passedCount;



  const averageScore =

    results.length > 0

      ? results.reduce(

          (sum, result) => sum + Number(result.percentage || 0),

          0

        ) / results.length

      : 0;



  const filteredResults = useMemo(() => {

    const term = search.trim().toLowerCase();



    return results.filter((result) => {

      const matchesSearch =

        !term ||

        result.studentName?.toLowerCase().includes(term) ||

        result.username?.toLowerCase().includes(term) ||

        result.email?.toLowerCase().includes(term) ||

        result.examTitle?.toLowerCase().includes(term);



      const matchesExam =

        examFilter === 'ALL' ||

        String(result.examId) === String(examFilter);



      const matchesStatus =

        statusFilter === 'ALL' ||

        (statusFilter === 'PASSED' && result.passed === true) ||

        (statusFilter === 'FAILED' && result.passed !== true);



      return matchesSearch && matchesExam && matchesStatus;

    });

  }, [results, search, examFilter, statusFilter]);



  const formatDateTime = (value) => {

    if (!value) return '—';



    const date = new Date(value);



    if (Number.isNaN(date.getTime())) {

      return value;

    }



    return date.toLocaleString('en-IN', {

      day: '2-digit',

      month: 'short',

      year: 'numeric',

      hour: '2-digit',

      minute: '2-digit'

    });

  };



  const formatTime = (seconds) => {

    if (!seconds && seconds !== 0) return '—';



    const total = Number(seconds);

    const minutes = Math.floor(total / 60);

    const remaining = total % 60;



    return `${minutes}m ${String(remaining).padStart(2, '0')}s`;

  };



  const getInitials = (name) => {

    if (!name) return 'S';



    return name

      .split(' ')

      .filter(Boolean)

      .slice(0, 2)

      .map((part) => part.charAt(0))

      .join('')

      .toUpperCase();

  };



  return (

    <section className="results-page">

      <div className="results-top-row">

        <button className="results-back-btn" onClick={onBack}>

          ← Dashboard

        </button>



        <button className="results-refresh-btn" onClick={loadResults}>

          ↻ Refresh

        </button>

      </div>



      <div className="results-heading">

        <div>

          <span>PERFORMANCE MANAGEMENT</span>

          <h2>Results</h2>

          <p>

            Review examination attempts, scores and student performance.

          </p>

        </div>

      </div>



      <div className="results-stat-grid">

        <div className="results-stat-card purple">

          <span>TOTAL ATTEMPTS</span>

          <strong>{results.length}</strong>

          <small>Completed examination attempts</small>

        </div>



        <div className="results-stat-card green">

          <span>PASSED</span>

          <strong>{passedCount}</strong>

          <small>Students meeting pass criteria</small>

        </div>



        <div className="results-stat-card red">

          <span>FAILED</span>

          <strong>{failedCount}</strong>

          <small>Attempts below pass criteria</small>

        </div>



        <div className="results-stat-card blue">

          <span>AVERAGE SCORE</span>

          <strong>{averageScore.toFixed(1)}%</strong>

          <small>Across all attempts</small>

        </div>

      </div>



      <div className="results-toolbar">

        <div className="results-search">

          <span>⌕</span>

          <input

            value={search}

            onChange={(event) => setSearch(event.target.value)}

            placeholder="Search student, username, email or exam..."

          />

        </div>



        <select

          value={examFilter}

          onChange={(event) => setExamFilter(event.target.value)}

        >

          <option value="ALL">All Exams</option>

          {exams.map((exam) => (

            <option key={exam.id} value={exam.id}>

              {exam.title}

            </option>

          ))}

        </select>



        <select

          value={statusFilter}

          onChange={(event) => setStatusFilter(event.target.value)}

        >

          <option value="ALL">All Results</option>

          <option value="PASSED">Passed</option>

          <option value="FAILED">Failed</option>

        </select>

      </div>



      <div className="results-list-card">

        <div className="results-list-header">

          <div>

            <span>EXAMINATION PERFORMANCE</span>

            <h3>All Results</h3>

          </div>



          <span className="results-count">

            {filteredResults.length} shown

          </span>

        </div>



        {loading ? (

          <div className="results-empty">

            <div className="results-spinner"></div>

            <p>Loading results...</p>

          </div>

        ) : filteredResults.length === 0 ? (

          <div className="results-empty">

            <div className="results-empty-icon">▣</div>

            <h3>No results found</h3>

            <p>

              {results.length === 0

                ? 'No examination attempts have been submitted yet.'

                : 'Try changing your search or filters.'}

            </p>

          </div>

        ) : (

          <div className="results-table-wrap">

            <table className="results-table">

              <thead>

                <tr>

                  <th>STUDENT</th>

                  <th>EXAMINATION</th>

                  <th>SCORE</th>

                  <th>PERCENTAGE</th>

                  <th>TIME TAKEN</th>

                  <th>SUBMITTED</th>

                  <th>RESULT</th>

                </tr>

              </thead>



              <tbody>

                {filteredResults.map((result) => (

                  <tr key={result.id}>

                    <td>

                      <div className="result-student">

                        <div className="result-avatar">

                          {getInitials(result.studentName)}

                        </div>



                        <div>

                          <strong>

                            {result.studentName || 'Unknown Student'}

                          </strong>

                          <span>

                            @{result.username || 'unknown'}

                          </span>

                        </div>

                      </div>

                    </td>



                    <td>

                      <div className="result-exam">

                        <strong>{result.examTitle}</strong>

                        <span>

                          {result.totalMarks || 0} total marks

                        </span>

                      </div>

                    </td>



                    <td>

                      <strong className="score-value">

                        {result.marksObtained ?? 0}/

                        {result.totalMarks ?? 0}

                      </strong>

                    </td>



                    <td>

                      <div className="percentage-cell">

                        <strong>

                          {Number(result.percentage || 0).toFixed(1)}%

                        </strong>



                        <div className="score-bar">

                          <div

                            style={{

                              width: `${Math.min(

                                100,

                                Math.max(

                                  0,

                                  Number(result.percentage || 0)

                                )

                              )}%`

                            }}

                          />

                        </div>

                      </div>

                    </td>



                    <td>

                      <span className="time-value">

                        {formatTime(result.timeTakenSeconds)}

                      </span>

                    </td>



                    <td>

                      <span className="submitted-value">

                        {formatDateTime(result.submissionTime)}

                      </span>

                    </td>



                    <td>

                      <span

                        className={

                          result.passed

                            ? 'result-badge passed'

                            : 'result-badge failed'

                        }

                      >

                        {result.passed ? '● Passed' : '● Failed'}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </section>

  );

}



export default Results;
