import React, { useMemo, useState } from 'react';
import axios from 'axios';
import './AIQuestionGenerator.css';

const AI_URL = 'http://localhost:5000/generate_questions';

const MCQ_TOPICS = [
  'Aptitude',
  'Java',
  'Spring Boot',
  'Python',
  'SQL',
  'JavaScript',
  'HTML',
  'CSS'
];

const CODING_LANGUAGES = [
  'Java',
  'Python',
  'C',
  'C++',
  'JavaScript',
  'SQL'
];

function AIQuestionGenerator({ onBack, onAddQuestions }) {
  const [questionType, setQuestionType] = useState('MCQ');
  const [topic, setTopic] = useState('Java');
  const [language, setLanguage] = useState('Java');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const currentSubject = questionType === 'CODING' ? language : topic;

  const selectedCount = selectedQuestions.length;

  const summaryText = useMemo(() => {
    if (!generated) return 'Select the question type, subject and difficulty, then generate.';
    return `${questions.length} ${questionType === 'CODING' ? 'coding' : 'MCQ'} question(s) generated for ${currentSubject}.`;
  }, [generated, questions.length, questionType, currentSubject]);

  const resetGeneratedQuestions = () => {
    setQuestions([]);
    setSelectedQuestions([]);
    setGenerated(false);
    setError('');
  };

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    setQuestions([]);
    setSelectedQuestions([]);
    setGenerated(false);
    setError('');

    if (value === 'MCQ') {
      setTopic('Java');
    } else {
      setLanguage('Java');
    }
  };

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      setGenerated(false);
      setQuestions([]);
      setSelectedQuestions([]);

      const payload = {
        topic,
        language,
        questionType,
        difficulty,
        count: Number(count)
      };

      const response = await axios.post(
        AI_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Question generation failed.');
      }

      const generatedQuestions = Array.isArray(data.questions)
        ? data.questions
        : [];

      if (generatedQuestions.length === 0) {
        throw new Error('The generator returned no questions.');
      }

      setQuestions(generatedQuestions);
      setSelectedQuestions(generatedQuestions.map((_, index) => index));
      setGenerated(true);
    } catch (err) {
      console.error('AI question generation error:', err);
      setQuestions([]);
      setSelectedQuestions([]);
      setGenerated(false);

      if (err.code === 'ECONNABORTED') {
        setError('The AI service took too long to respond. Make sure the Python service is running on port 5000.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to the Python AI service. Start app.py and keep port 5000 running.');
      } else {
        setError(err.message || 'Unable to generate questions.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (index) => {
    setSelectedQuestions((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    );
  };

  const selectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((_, index) => index));
    }
  };

  const removeQuestion = (index) => {
    setQuestions((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
    setSelectedQuestions((previous) =>
      previous
        .filter((item) => item !== index)
        .map((item) => (item > index ? item - 1 : item))
    );
  };

  const addSelectedToExam = () => {
    const selected = selectedQuestions
      .map((index) => questions[index])
      .filter(Boolean);

    if (!selected.length) {
      setError('Select at least one question first.');
      return;
    }

    if (onAddQuestions) {
      onAddQuestions(selected);
      setError('');
    }
  };

  return (
    <div className="ai-generator-page">
      <div className="ai-generator-header">
        <div>
          <div className="ai-eyebrow">EXAMPRO AI</div>
          <h1>✦ AI Question Generator</h1>
          <p>
            Build one mixed question paper: aptitude, technical MCQs and coding questions can all be added to the same exam.
          </p>
        </div>

        <div className="ai-header-actions">
          <button
            type="button"
            className="ai-generate-btn"
            onClick={generateQuestions}
            disabled={loading}
          >
            {loading ? 'Generating...' : '✦ Generate Questions'}
          </button>

          {onBack && (
            <button type="button" className="ai-back-btn" onClick={onBack}>
              ← Back to Exam
            </button>
          )}
        </div>
      </div>

      <div className="ai-builder-card">
        <div className="ai-builder-intro">
          <div className="ai-robot-icon">🤖</div>
          <div>
            <h3>Build Your Question Set</h3>
            <p>
              Generate questions, select the ones you need, and add them directly into the current exam paper.
            </p>
          </div>
        </div>

        <div className="ai-control-grid ai-control-grid-four">
          <div className="ai-control-group">
            <label>Question Type</label>
            <select
              value={questionType}
              onChange={(e) => handleQuestionTypeChange(e.target.value)}
            >
              <option value="MCQ">MCQ / Aptitude</option>
              <option value="CODING">Coding</option>
            </select>
          </div>

          {questionType === 'MCQ' ? (
            <div className="ai-control-group">
              <label>Subject</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {MCQ_TOPICS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="ai-control-group">
              <label>Programming Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {CODING_LANGUAGES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}

          <div className="ai-control-group">
            <label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="ai-control-group">
            <label>Number of Questions</label>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                <option key={number} value={number}>{number}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ai-generation-summary">
          <span className="ai-summary-pill">{questionType}</span>
          <span className="ai-summary-pill">{currentSubject}</span>
          <span className="ai-summary-pill">{difficulty}</span>
          <span className="ai-summary-pill">{count} requested</span>
          <span className="ai-summary-text">{summaryText}</span>
        </div>
      </div>

      {error && (
        <div className="ai-error">
          <span>⚠</span>
          <span>{error}</span>
          {error.toLowerCase().includes('python ai service') && (
            <button type="button" onClick={resetGeneratedQuestions}>Dismiss</button>
          )}
        </div>
      )}

      {generated && questions.length > 0 && (
        <div className="ai-results-toolbar">
          <div>
            <strong>Generated Questions</strong>
            <span>{questions.length} available • {selectedCount} selected</span>
          </div>
          <div className="ai-results-actions">
            <button type="button" className="ai-secondary-btn" onClick={selectAll}>
              {selectedQuestions.length === questions.length ? 'Clear Selection' : 'Select All'}
            </button>
            <button type="button" className="ai-add-btn" onClick={addSelectedToExam}>
              ＋ Add Selected to Exam ({selectedCount})
            </button>
          </div>
        </div>
      )}

      <div className="ai-question-list">
        {questions.map((question, index) => {
          const selected = selectedQuestions.includes(index);
          const isCoding = question.questionType === 'CODING';

          return (
            <div className={`ai-question-card ${selected ? 'selected' : ''}`} key={`${index}-${question.questionText}`}>
              <div className="ai-question-topline">
                <div className="ai-question-number">Q{index + 1}</div>
                <div className="ai-question-tags">
                  <span>{question.topic || currentSubject}</span>
                  <span>{question.difficulty || difficulty}</span>
                  <span>{question.marks || 1} Marks</span>
                  {isCoding && <span className="coding-tag">CODING</span>}
                </div>
                <label className="ai-select-check">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleQuestion(index)}
                  />
                  Select
                </label>
              </div>

              <h3>{question.questionText}</h3>

              {isCoding ? (
                <div className="ai-coding-preview">
                  <div className="ai-code-language">
                    Language: <strong>{question.topic || currentSubject}</strong>
                  </div>
                  <p>{question.problemStatement}</p>
                  <div className="ai-sample-grid">
                    <div><span>Sample Input</span><code>{question.sampleInput || '—'}</code></div>
                    <div><span>Sample Output</span><code>{question.sampleOutput || '—'}</code></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="ai-option-grid">
                    {['A', 'B', 'C', 'D'].map((letter) => (
                      <div
                        key={letter}
                        className={`ai-option ${question.correctAnswer === letter ? 'correct' : ''}`}
                      >
                        <span>{letter}</span>
                        <p>{question[`option${letter}`]}</p>
                        {question.correctAnswer === letter && <small>✓ Correct</small>}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="ai-explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </>
              )}

              <button type="button" className="ai-remove-btn" onClick={() => removeQuestion(index)}>
                Remove
              </button>
            </div>
          );
        })}

        {!generated && (
          <div className="ai-empty-state">
            <div>✦</div>
            <strong>No questions generated yet</strong>
            <p>Select the type, subject/language, difficulty and count, then click Generate Questions.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIQuestionGenerator;
