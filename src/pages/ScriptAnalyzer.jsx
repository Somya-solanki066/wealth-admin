import { useEffect, useState } from 'react';
import { scriptAnalyzerService } from '../services/scriptAnalyzerService';
import './AiConfig.css';

const INDUSTRIES = [
  { id: 'hollywood', label: 'Hollywood' },
  { id: 'nollywood', label: 'Nollywood' },
  { id: 'bbc_uk', label: 'BBC / UK Television' },
  { id: 'netflix_africa', label: 'Netflix Africa' },
  { id: 'audio_drama', label: 'Audio Drama' },
];

const FORMATS = [
  { id: 'feature', label: 'Feature Film' },
  { id: 'tv_pilot', label: 'TV Pilot' },
  { id: 'short', label: 'Short Film' },
  { id: 'audio_drama', label: 'Audio Drama' },
];

const ANALYSIS_MODES = [
  { id: 'full_script', label: 'Full Script' },
  { id: 'scene_analysis', label: 'Scene Analysis' },
  { id: 'dialogue_punchup', label: 'Dialogue Punch-Up' },
];

const CATEGORY_LABELS = {
  premise: 'Premise (20%)',
  dialogue: 'Dialogue (15%)',
  structure: 'Structure (20%)',
  character: 'Character (20%)',
  scene_purpose: 'Scene Purpose (15%)',
  formatting: 'Formatting (10%)',
};

function verdictClass(verdict) {
  if (verdict === 'PITCH READY') return 'verdict-ready';
  if (verdict === 'STRONG CONTENDER') return 'verdict-strong';
  if (verdict === 'REVISE BEFORE PITCHING') return 'verdict-revise';
  return 'verdict-major';
}

export default function ScriptAnalyzer() {
  const [section, setSection] = useState('run');
  const [industry, setIndustry] = useState('hollywood');
  const [format, setFormat] = useState('feature');
  const [analysisMode, setAnalysisMode] = useState('full_script');
  const [scriptText, setScriptText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isDefaultPrompt, setIsDefaultPrompt] = useState(true);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const [running, setRunning] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPrompt(industry);
  }, [industry]);

  const loadPrompt = async (nextIndustry) => {
    setLoadingPrompt(true);
    try {
      const response = await scriptAnalyzerService.getPrompt(nextIndustry);
      const data = response.data || {};
      setPrompt(data.prompt || '');
      setIsDefaultPrompt(Boolean(data.isDefault));
    } catch (error) {
      console.error(error);
      setPrompt('');
      setMessage('Failed to load prompt');
    } finally {
      setLoadingPrompt(false);
    }
  };

  const runAnalysis = async () => {
    if (!scriptText.trim()) {
      setMessage('Paste script text before running analysis.');
      return;
    }
    setRunning(true);
    setMessage('');
    setResult(null);
    try {
      const response = await scriptAnalyzerService.analyze({
        industry,
        format,
        analysisMode,
        scriptText,
      });
      setResult(response);
      setMessage('Analysis complete.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Analysis failed.');
    } finally {
      setRunning(false);
    }
  };

  const savePrompt = async () => {
    if (!prompt.trim()) {
      setMessage('Prompt cannot be empty.');
      return;
    }
    setSavingPrompt(true);
    setMessage('');
    try {
      await scriptAnalyzerService.savePrompt(industry, prompt);
      setIsDefaultPrompt(false);
      setMessage(`Prompt saved for ${INDUSTRIES.find((i) => i.id === industry)?.label || industry}`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save prompt');
    } finally {
      setSavingPrompt(false);
    }
  };

  return (
    <div className="ai-config-page">
      <div className="page-header">
        <div>
          <h2>Script Analyzer (GPT)</h2>
          <p>
            Test industry-calibrated script analysis and manage system prompts for Hollywood, Nollywood,
            BBC/UK, Netflix Africa, and Audio Drama.
          </p>
        </div>
      </div>

      {message && <div className="status-banner">{message}</div>}

      <div className="feedback-tabs" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`feedback-tab ${section === 'run' ? 'active' : ''}`}
          onClick={() => setSection('run')}
        >
          Run Test
        </button>
        <button
          type="button"
          className={`feedback-tab ${section === 'prompts' ? 'active' : ''}`}
          onClick={() => setSection('prompts')}
        >
          Prompt Management
        </button>
      </div>

      {section === 'run' ? (
        <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <section className="config-section">
            <h3>Analysis Input</h3>
            <div className="form-row" style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
              <label>
                Industry
                <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  {INDUSTRIES.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Format
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  {FORMATS.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Analysis Mode
                <select value={analysisMode} onChange={(e) => setAnalysisMode(e.target.value)}>
                  {ANALYSIS_MODES.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste screenplay or audio drama script here..."
              rows={22}
              style={{ width: '100%', fontFamily: 'Courier New, monospace', fontSize: 13 }}
            />
            <button className="save-btn" onClick={runAnalysis} disabled={running} style={{ marginTop: 12 }}>
              {running ? 'Analyzing...' : 'Run Script Analysis'}
            </button>
          </section>

          <section className="config-section">
            <h3>Results</h3>
            {!result && !running && (
              <p className="muted">Run an analysis to see pitch readiness score, category breakdown, and notes.</p>
            )}
            {running && <p>GPT is evaluating premise, dialogue, structure, character, scene purpose, and formatting...</p>}
            {result && (
              <div className="script-analyzer-results">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      border: '4px solid #c9a227',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {result.pitch_readiness_score}
                  </div>
                  <div>
                    <span className={`verdict-badge ${verdictClass(result.verdict)}`}>{result.verdict}</span>
                    {result.model && <div className="muted" style={{ marginTop: 6 }}>Model: {result.model}</div>}
                  </div>
                </div>

                <p style={{ marginBottom: 16, lineHeight: 1.5 }}>{result.editor_note}</p>

                <h4>Category Scores</h4>
                <div style={{ marginBottom: 20 }}>
                  {result.scores && Object.entries(result.scores).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span>{CATEGORY_LABELS[key] || key}</span>
                        <strong>{value}/10</strong>
                      </div>
                      <div style={{ height: 6, background: '#2a2a2a', borderRadius: 4 }}>
                        <div
                          style={{
                            width: `${(Number(value) / 10) * 100}%`,
                            height: '100%',
                            background: '#c9a227',
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {result.strengths?.length > 0 && (
                  <>
                    <h4>Strengths</h4>
                    <ul style={{ marginBottom: 16 }}>
                      {result.strengths.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </>
                )}

                {result.issues?.length > 0 && (
                  <>
                    <h4>Issues</h4>
                    <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                      {result.issues.map((issue, i) => (
                        <div key={i} style={{ padding: 12, background: '#1a1a1a', borderRadius: 8 }}>
                          <strong>{issue.label}</strong>
                          <span className="muted" style={{ marginLeft: 8 }}>({issue.category})</span>
                          <p style={{ margin: '6px 0' }}>{issue.detail}</p>
                          {issue.fix && <p><em>Fix: {issue.fix}</em></p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {result.line_notes?.length > 0 && (
                  <>
                    <h4>Line Notes</h4>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {result.line_notes.map((note, i) => (
                        <div key={i} style={{ padding: 10, background: '#141414', borderRadius: 8, fontSize: 13 }}>
                          <code style={{ display: 'block', marginBottom: 6 }}>{note.original}</code>
                          <p>{note.issue}</p>
                          {note.suggestion && <p className="muted">→ {note.suggestion}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="config-section">
          <h3>System Prompt — {INDUSTRIES.find((i) => i.id === industry)?.label}</h3>
          <label>
            Industry
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ marginBottom: 12 }}>
              {INDUSTRIES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          {isDefaultPrompt && !loadingPrompt && (
            <p className="muted" style={{ marginBottom: 8 }}>Using built-in default prompt (not yet customized in Firestore).</p>
          )}
          {loadingPrompt ? (
            <p>Loading prompt...</p>
          ) : (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={28}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
            />
          )}
          <button className="save-btn" onClick={savePrompt} disabled={savingPrompt || loadingPrompt} style={{ marginTop: 12 }}>
            {savingPrompt ? 'Saving...' : 'Save Prompt'}
          </button>
        </section>
      )}
    </div>
  );
}
