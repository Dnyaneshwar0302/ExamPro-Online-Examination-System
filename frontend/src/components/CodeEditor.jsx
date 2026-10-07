import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

/*
 * These languages are supported by the current CodeEvaluator.
 * SQL is intentionally not included because the current evaluator
 * executes programs and does not have a SQL database runner.
 */
const LANGUAGE_OPTIONS = [
  'Python',
  'Java',
  'C++',
  'C',
  'JavaScript'
];

const STARTER_CODE = {
  Python: `# Write your solution below
import sys

def solve():
    # Read input
    # Example:
    # n = int(input())

    pass

if __name__ == "__main__":
    solve()
`,

  Java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Write your solution here

    }
}
`,

  'C++': `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}
`,

  C: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your solution here

    return 0;
}
`,

  JavaScript: `const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim();

// Write your solution here

`
};

function CodeEditor({
  code,
  onChange,
  questionId,
  language = 'Python',
  starterCode = '',
  onLanguageChange = () => {}
}) {
  const initialLanguage = LANGUAGE_OPTIONS.includes(language)
    ? language
    : 'Python';

  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  /*
   * Keep the selected language synchronized with the question's
   * original programming language when the student moves to a
   * different coding question.
   */
  useEffect(() => {
    const nextLanguage = LANGUAGE_OPTIONS.includes(language)
      ? language
      : 'Python';

    setSelectedLanguage(nextLanguage);
    onLanguageChange(nextLanguage);
    setEvaluation(null);
    setError('');

    if (starterCode && (!code || code.trim() === '')) {
      onChange(starterCode);
    }
  }, [questionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStarterCode = (nextLanguage) => {
    /*
     * Use the question's stored starter code only when the selected
     * language is the question's original language. Otherwise use
     * the built-in starter template for the selected language.
     */
    const originalLanguage = String(language || 'Python').trim();

    if (
      nextLanguage === originalLanguage &&
      starterCode &&
      starterCode.trim()
    ) {
      return starterCode;
    }

    return STARTER_CODE[nextLanguage] || '';
  };

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;

    if (nextLanguage === selectedLanguage) {
      return;
    }

    const currentCode = code || '';
    const currentStarter = getStarterCode(selectedLanguage).trim();

    /*
     * If the student has already written code, ask before replacing it.
     * This prevents accidental loss of their solution.
     */
    if (
      currentCode.trim() &&
      currentCode.trim() !== currentStarter
    ) {
      const confirmed = window.confirm(
        `Switching to ${nextLanguage} will replace the current code with ${nextLanguage} starter code. Continue?`
      );

      if (!confirmed) {
        return;
      }
    }

    setSelectedLanguage(nextLanguage);
    onLanguageChange(nextLanguage);
    onChange(getStarterCode(nextLanguage));
    setEvaluation(null);
    setError('');
  };

  const handleRunCode = async () => {
    if (!code || !code.trim()) {
      setError('Please write your code before running it.');
      return;
    }

    setRunning(true);
    setError('');
    setEvaluation(null);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${BACKEND_URL}/api/student/coding/run`,
        {
          questionId,
          code,
          language: selectedLanguage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 15000
        }
      );

      setEvaluation(response.data);
    } catch (err) {
      console.error('Run code error:', err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to run the code. Please check the backend service.'
      );
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code || !code.trim()) {
      setError('Please write your code before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    setEvaluation(null);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${BACKEND_URL}/api/student/coding/submit`,
        {
          questionId,
          code,
          language: selectedLanguage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 20000
        }
      );

      setEvaluation(response.data);
    } catch (err) {
      console.error('Submit code error:', err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to submit the code. Please check the backend service.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    onChange(getStarterCode(selectedLanguage));
    setEvaluation(null);
    setError('');
  };

  const results =
    evaluation?.results ||
    evaluation?.testResults ||
    evaluation?.test_cases ||
    [];

  const marksObtained =
    evaluation?.marksObtained ??
    evaluation?.marks ??
    0;

  const totalMarks =
    evaluation?.totalMarks ??
    0;

  const passedTests =
    evaluation?.passedTests ??
    results.filter(
      (result) =>
        result?.passed === true ||
        result?.status === 'PASSED' ||
        result?.status === 'PASS'
    ).length;

  const totalTests =
    evaluation?.totalTests ??
    results.length;

  return (
    <div
      style={{
        marginTop: '20px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '18px'
      }}
    >
      {/* EDITOR HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '12px'
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              color: '#1e293b',
              fontSize: '17px'
            }}
          >
            💻 Your Code
          </h4>

          <span
            style={{
              display: 'inline-block',
              marginTop: '6px',
              padding: '5px 10px',
              borderRadius: '999px',
              background: '#ede9fe',
              color: '#6d28d9',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            {selectedLanguage}
          </span>
        </div>

        {/* LANGUAGE DROPDOWN */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px'
          }}
        >
          <label
            htmlFor={`language-${questionId}`}
            style={{
              color: '#334155',
              fontSize: '13px',
              fontWeight: 800
            }}
          >
            Language:
          </label>

          <select
            id={`language-${questionId}`}
            value={selectedLanguage}
            onChange={handleLanguageChange}
            disabled={running || submitting}
            style={{
              minWidth: '150px',
              padding: '9px 34px 9px 12px',
              border: '2px solid #c7d2fe',
              borderRadius: '10px',
              background: '#ffffff',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '13px',
              outline: 'none',
              cursor:
                running || submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CODE EDITOR */}
      <textarea
        value={code || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your solution here..."
        style={{
          width: '100%',
          minHeight: '340px',
          boxSizing: 'border-box',
          padding: '16px',
          border: '2px solid #334155',
          borderRadius: '12px',
          fontFamily:
            'Consolas, "Courier New", monospace',
          fontSize: '14px',
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          resize: 'vertical',
          lineHeight: '1.6',
          outline: 'none'
        }}
        spellCheck="false"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
      />

      {/* ACTION BUTTONS */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginTop: '14px'
        }}
      >
        <button
          type="button"
          onClick={handleRunCode}
          disabled={running || submitting}
          style={{
            border: 'none',
            borderRadius: '10px',
            padding: '11px 18px',
            background:
              running || submitting ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            fontWeight: 700,
            cursor:
              running || submitting
                ? 'not-allowed'
                : 'pointer'
          }}
        >
          {running ? '⏳ Running...' : '▶ Run Code'}
        </button>

        <button
          type="button"
          onClick={handleSubmitCode}
          disabled={running || submitting}
          style={{
            border: 'none',
            borderRadius: '10px',
            padding: '11px 18px',
            background:
              running || submitting ? '#94a3b8' : '#16a34a',
            color: '#ffffff',
            fontWeight: 700,
            cursor:
              running || submitting
                ? 'not-allowed'
                : 'pointer'
          }}
        >
          {submitting ? '⏳ Submitting...' : '✓ Submit Code'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={running || submitting}
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '11px 18px',
            background: '#ffffff',
            color: '#334155',
            fontWeight: 700,
            cursor:
              running || submitting
                ? 'not-allowed'
                : 'pointer'
          }}
        >
          ↻ Reset Starter Code
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '13px 15px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '14px',
            lineHeight: 1.5
          }}
        >
          <strong>⚠ Error:</strong> {error}
        </div>
      )}

      {/* EVALUATION RESULT */}
      {evaluation && (
        <div
          style={{
            marginTop: '18px',
            padding: '18px',
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #dbeafe'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap',
              marginBottom: '14px'
            }}
          >
            <div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '1.5px'
                }}
              >
                CODE EVALUATION
              </div>

              <div
                style={{
                  marginTop: '5px',
                  color: '#0f172a',
                  fontSize: '22px',
                  fontWeight: 800
                }}
              >
                Score: {marksObtained}
                {totalMarks ? ` / ${totalMarks}` : ''}
              </div>
            </div>

            {totalTests > 0 && (
              <div
                style={{
                  padding: '8px 13px',
                  borderRadius: '999px',
                  background:
                    passedTests === totalTests
                      ? '#dcfce7'
                      : '#fef3c7',
                  color:
                    passedTests === totalTests
                      ? '#166534'
                      : '#92400e',
                  fontWeight: 800,
                  fontSize: '13px'
                }}
              >
                {passedTests} / {totalTests} Tests Passed
              </div>
            )}
          </div>

          {evaluation.message && (
            <div
              style={{
                marginBottom: '14px',
                color: '#475569',
                fontSize: '14px'
              }}
            >
              {evaluation.message}
            </div>
          )}

          {/* TEST CASE RESULTS */}
          {results.length > 0 && (
            <div>
              <div
                style={{
                  color: '#334155',
                  fontWeight: 800,
                  marginBottom: '9px'
                }}
              >
                Test Case Results
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '8px'
                }}
              >
                {results.map((result, index) => {
                  const passed =
                    result?.passed === true ||
                    result?.status === 'PASSED' ||
                    result?.status === 'PASS';

                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 13px',
                        borderRadius: '9px',
                        background: passed
                          ? '#f0fdf4'
                          : '#fef2f2',
                        border: `1px solid ${
                          passed ? '#bbf7d0' : '#fecaca'
                        }`
                      }}
                    >
                      <span
                        style={{
                          color: passed
                            ? '#166534'
                            : '#b91c1c',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}
                      >
                        {passed ? '✓' : '✗'} Test Case {index + 1}
                      </span>

                      <span
                        style={{
                          color: '#64748b',
                          fontSize: '12px'
                        }}
                      >
                        {result?.message ||
                          result?.error ||
                          (passed ? 'Passed' : 'Failed')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CodeEditor;
