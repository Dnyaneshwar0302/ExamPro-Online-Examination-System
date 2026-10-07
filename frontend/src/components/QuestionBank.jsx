import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './QuestionBank.css';

const emptyQuestion = {
  examId: '',
  questionText: '',
  questionType: 'MCQ',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  marks: 10,
  problemStatement: '',
  sampleInput: '',
  sampleOutput: '',
  testCases: ''
};

function QuestionBank({ onBack }) {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [examFilter, setExamFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyQuestion);

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [questionsResponse, examsResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/questions', { headers }),
        axios.get('http://localhost:8080/api/admin/exams', { headers })
      ]);

      setQuestions(
        Array.isArray(questionsResponse.data) ? questionsResponse.data : []
      );

      setExams(
        Array.isArray(examsResponse.data) ? examsResponse.data : []
      );
    } catch (error) {
      console.error(error);
      alert(
        'Unable to load Question Bank: ' +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        !term ||
        question.questionText?.toLowerCase().includes(term) ||
        question.examTitle?.toLowerCase().includes(term);

      const matchesType =
        typeFilter === 'ALL' || question.questionType === typeFilter;

      const matchesExam =
        examFilter === 'ALL' ||
        String(question.examId) === String(examFilter);

      return matchesSearch && matchesType && matchesExam;
    });
  }, [questions, search, typeFilter, examFilter]);

  const mcqCount = questions.filter((q) => q.questionType === 'MCQ').length;
  const codingCount = questions.filter(
    (q) => q.questionType === 'CODING'
  ).length;
  const totalMarks = questions.reduce(
    (sum, q) => sum + Number(q.marks || 0),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyQuestion,
      examId: exams.length > 0 ? String(exams[0].id) : ''
    });
    setShowForm(true);
  };

  const openEdit = (question) => {
    setEditingId(question.id);
    setForm({
      examId: question.examId ? String(question.examId) : '',
      questionText: question.questionText || '',
      questionType: question.questionType || 'MCQ',
      optionA: question.optionA || '',
      optionB: question.optionB || '',
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      correctAnswer: question.correctAnswer || 'A',
      marks: question.marks ?? 10,
      problemStatement: question.problemStatement || '',
      sampleInput: question.sampleInput || '',
      sampleOutput: question.sampleOutput || '',
      testCases: question.testCases || ''
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyQuestion);
  };

  const saveQuestion = async (event) => {
    event.preventDefault();

    if (!form.examId) {
      alert('Please select an examination.');
      return;
    }

    if (!form.questionText.trim()) {
      alert('Please enter question text.');
      return;
    }

    if (form.questionType === 'MCQ') {
      if (
        !form.optionA.trim() ||
        !form.optionB.trim() ||
        !form.optionC.trim() ||
        !form.optionD.trim()
      ) {
        alert('Please enter all four MCQ options.');
        return;
      }
    }

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:8080/api/admin/questions/${editingId}`,
          form,
          { headers }
        );
        alert('Question updated successfully!');
      } else {
        await axios.post(
          'http://localhost:8080/api/admin/questions',
          form,
          { headers }
        );
        alert('Question added successfully!');
      }

      closeForm();
      await loadData();
    } catch (error) {
      alert(
        'Unable to save question: ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const deleteQuestion = async (question) => {
    const confirmed = window.confirm(
      `Delete this question?\n\n"${question.questionText}"`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/admin/questions/${question.id}`,
        { headers }
      );

      alert('Question deleted successfully.');
      await loadData();
    } catch (error) {
      alert(
        'Unable to delete question: ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <section className="question-bank-page">
      <div className="qb-top-row">
        <button className="qb-back-btn" onClick={onBack}>
          ← Dashboard
        </button>

        <button className="qb-refresh-btn" onClick={loadData}>
          ↻ Refresh
        </button>
      </div>

      <div className="qb-heading">
        <div>
          <span>QUESTION MANAGEMENT</span>
          <h2>Question Bank</h2>
          <p>
            Create, search, edit and organize questions used in your
            examinations.
          </p>
        </div>

        <button className="qb-add-btn" onClick={openCreate}>
          ＋ Add Question
        </button>
      </div>

      <div className="qb-stat-grid">
        <div className="qb-stat-card purple">
          <span>Total Questions</span>
          <strong>{questions.length}</strong>
          <small>Across all examinations</small>
        </div>

        <div className="qb-stat-card green">
          <span>MCQ Questions</span>
          <strong>{mcqCount}</strong>
          <small>Multiple choice</small>
        </div>

        <div className="qb-stat-card blue">
          <span>Coding Questions</span>
          <strong>{codingCount}</strong>
          <small>Programming problems</small>
        </div>

        <div className="qb-stat-card orange">
          <span>Total Marks</span>
          <strong>{totalMarks}</strong>
          <small>Question bank marks</small>
        </div>
      </div>

      <div className="qb-toolbar">
        <div className="qb-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search question or examination..."
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="MCQ">MCQ</option>
          <option value="CODING">Coding</option>
        </select>

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
      </div>

      <div className="qb-list-card">
        <div className="qb-list-header">
          <div>
            <span>LIBRARY</span>
            <h3>All Questions</h3>
          </div>

          <span className="qb-count">
            {filteredQuestions.length} shown
          </span>
        </div>

        {loading ? (
          <div className="qb-empty">
            <div className="qb-spinner"></div>
            <p>Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="qb-empty">
            <div className="qb-empty-icon">?</div>
            <h3>No questions found</h3>
            <p>
              Try changing your search/filter or add a new question.
            </p>
          </div>
        ) : (
          <div className="qb-question-list">
            {filteredQuestions.map((question, index) => (
              <div className="qb-question-card" key={question.id}>
                <div className="qb-number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="qb-question-content">
                  <div className="qb-question-top">
                    <span
                      className={`qb-type ${
                        question.questionType === 'CODING'
                          ? 'coding'
                          : 'mcq'
                      }`}
                    >
                      {question.questionType === 'CODING'
                        ? 'CODING'
                        : 'MCQ'}
                    </span>

                    <span className="qb-marks">
                      {question.marks || 0} marks
                    </span>
                  </div>

                  <h4>{question.questionText}</h4>

                  <div className="qb-meta">
                    <span>▣ {question.examTitle || 'Unassigned'}</span>

                    {question.questionType === 'MCQ' && (
                      <span>
                        Correct: <strong>{question.correctAnswer || '-'}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="qb-actions">
                  <button onClick={() => openEdit(question)}>
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => deleteQuestion(question)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="qb-modal-overlay" onMouseDown={closeForm}>
          <div
            className="qb-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="qb-modal-header">
              <div>
                <span>{editingId ? 'QUESTION EDITOR' : 'NEW QUESTION'}</span>
                <h3>{editingId ? 'Edit Question' : 'Add Question'}</h3>
              </div>

              <button onClick={closeForm}>×</button>
            </div>

            <form onSubmit={saveQuestion}>
              <div className="qb-form-grid">
                <div className="qb-field full">
                  <label>Examination *</label>
                  <select
                    name="examId"
                    value={form.examId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select examination</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="qb-field full">
                  <label>Question Text *</label>
                  <textarea
                    name="questionText"
                    value={form.questionText}
                    onChange={handleChange}
                    placeholder="Enter the question..."
                    rows="4"
                    required
                  />
                </div>

                <div className="qb-field">
                  <label>Question Type</label>
                  <select
                    name="questionType"
                    value={form.questionType}
                    onChange={handleChange}
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>

                <div className="qb-field">
                  <label>Marks</label>
                  <input
                    type="number"
                    name="marks"
                    min="1"
                    value={form.marks}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {form.questionType === 'MCQ' ? (
                <>
                  <div className="qb-section-title">Answer Options</div>

                  <div className="qb-options-grid">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div className={`qb-option option-${option}`} key={option}>
                        <span>{option}</span>
                        <input
                          type="text"
                          name={`option${option}`}
                          value={form[`option${option}`]}
                          onChange={handleChange}
                          placeholder={`Option ${option}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="qb-form-grid">
                    <div className="qb-field">
                      <label>Correct Answer</label>
                      <select
                        name="correctAnswer"
                        value={form.correctAnswer}
                        onChange={handleChange}
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="qb-section-title">Coding Problem</div>

                  <div className="qb-form-grid">
                    <div className="qb-field full">
                      <label>Problem Statement</label>
                      <textarea
                        name="problemStatement"
                        value={form.problemStatement}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe the programming problem..."
                      />
                    </div>

                    <div className="qb-field">
                      <label>Sample Input</label>
                      <textarea
                        className="code"
                        name="sampleInput"
                        value={form.sampleInput}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>

                    <div className="qb-field">
                      <label>Sample Output</label>
                      <textarea
                        className="code"
                        name="sampleOutput"
                        value={form.sampleOutput}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>

                    <div className="qb-field full">
                      <label>Test Cases (JSON)</label>
                      <textarea
                        className="code"
                        name="testCases"
                        value={form.testCases}
                        onChange={handleChange}
                        rows="4"
                        placeholder='[{"input":"5","output":"25"}]'
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="qb-modal-actions">
                <button
                  type="button"
                  className="qb-cancel-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button type="submit" className="qb-save-btn">
                  {editingId ? 'Save Changes' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default QuestionBank;
