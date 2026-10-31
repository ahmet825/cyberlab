import React, { useState } from 'react';
import './hotel.css';
import { HOTEL_QUIZ_QUESTIONS, HOTEL_FILE_UPLOAD_QUIZ_QUESTIONS, type QuizQuestion } from '../../data/hotelQuizData';
import { CheckCircle2, Award, AlertTriangle, ArrowRight, RotateCcw, Code, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HotelQuizModuleProps {
  scenario?: 'api' | 'file-upload';
}

export const HotelQuizModule: React.FC<HotelQuizModuleProps> = ({ scenario = 'api' }) => {
  const questions: QuizQuestion[] = scenario === 'file-upload' ? HOTEL_FILE_UPLOAD_QUIZ_QUESTIONS : HOTEL_QUIZ_QUESTIONS;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCodeDiff, setShowCodeDiff] = useState(false);

  // Reset when scenario changes
  React.useEffect(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setShowCodeDiff(false);
  }, [scenario]);

  const question: QuizQuestion = questions[currentQuestionIndex] || questions[0];
  const totalQuestions = questions.length;

  const handleSelectOption = (optKey: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [question.id]: optKey
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowCodeDiff(false);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowCodeDiff(false);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const selected = userAnswers[q.id];
      const correctOpt = q.options.find(o => o.isCorrect)?.key;
      if (selected === correctOpt) {
        correctCount++;
      }
    });

    const wrongCount = totalQuestions - correctCount;
    const isPass = correctCount >= 7; // 10 üzerinden 7 doğru barajı (%70+)
    return { correctCount, wrongCount, isPass, scorePercent: Math.round((correctCount / totalQuestions) * 100) };
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const { isPass } = calculateResults();
    if (isPass) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setShowCodeDiff(false);
  };

  const results = calculateResults();
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-darker, #060910)',
      color: 'var(--text-main, #f8fafc)',
      fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
      overflow: 'hidden'
    }}>
      {/* Quiz Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        backgroundColor: 'var(--bg-dark, #0a0f1d)',
        borderBottom: '1px solid var(--border-subtle, #1e293b)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono, monospace)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            padding: '3px',
            borderRadius: '4px',
            background: 'rgba(0, 240, 255, 0.1)',
            color: 'var(--accent-cyan, #00f0ff)',
            border: '1px solid var(--border-cyan, rgba(0, 240, 255, 0.3))'
          }}>
            <Award size={14} />
          </div>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--text-main, #f8fafc)' }}>Kod Okuma & Zafiyet Sınavı</span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim, #64748b)', marginLeft: '6px' }}>(10 Soru / Pass Barajı: 7)</span>
          </div>
        </div>

        {/* Counter / Result */}
        {!isSubmitted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-dim, #64748b)', fontSize: '10.5px' }}>İlerleme:</span>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--bg-card, #0f172a)',
              color: 'var(--accent-cyan, #00f0ff)',
              fontWeight: 800,
              fontSize: '11px',
              border: '1px solid var(--border-subtle, #1e293b)'
            }}>
              {answeredCount} / {totalQuestions}
            </span>
          </div>
        ) : (
          <div style={{
            padding: '3px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.5px',
            background: results.isPass ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 51, 102, 0.15)',
            color: results.isPass ? 'var(--accent-green, #00ff9d)' : 'var(--accent-red, #ff3366)',
            border: `1px solid ${results.isPass ? 'var(--border-accent)' : 'rgba(255, 51, 102, 0.4)'}`
          }}>
            {results.isPass ? 'PASS (GEÇTİ)' : 'FAIL (KALDI)'}
          </div>
        )}
      </div>

      {/* Pager */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        backgroundColor: 'var(--bg-dark, #0a0f1d)',
        borderBottom: '1px solid var(--border-subtle, #1e293b)',
        overflowX: 'auto'
      }}>
        {questions.map((q, idx) => {
          const isAnswered = userAnswers[q.id] !== undefined;
          const isCurrent = currentQuestionIndex === idx;
          const isCorrect = isSubmitted && userAnswers[q.id] === q.options.find(o => o.isCorrect)?.key;

          let bg = 'var(--bg-input, #090e1a)';
          let border = 'var(--border-subtle, #1e293b)';
          let color = 'var(--text-dim, #64748b)';

          if (isSubmitted) {
            bg = isCorrect ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 51, 102, 0.15)';
            border = isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';
            color = isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';
          } else if (isCurrent) {
            bg = 'rgba(0, 240, 255, 0.2)';
            border = 'var(--accent-cyan)';
            color = 'var(--accent-cyan)';
          } else if (isAnswered) {
            bg = 'var(--bg-card, #0f172a)';
            color = 'var(--text-main, #f8fafc)';
          }

          return (
            <button
              key={q.id}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                setShowCodeDiff(false);
              }}
              style={{
                minWidth: '24px',
                height: '24px',
                borderRadius: '4px',
                border: `1px solid ${border}`,
                background: bg,
                color: color,
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                fontWeight: isCurrent ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title={`Soru ${idx + 1}: ${q.title}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question or Results */}
      {!isSubmitted ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{
              fontSize: '10.5px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--bg-card, #0f172a)',
              color: 'var(--text-muted, #94a3b8)',
              border: '1px solid var(--border-subtle, #1e293b)',
              fontFamily: 'var(--font-mono)'
            }}>
              Soru {currentQuestionIndex + 1} / {totalQuestions} • <strong style={{ color: 'var(--accent-orange, #f59e0b)' }}>{question.category}</strong>
            </span>

            {question.fixedCode && (
              <button
                onClick={() => setShowCodeDiff(!showCodeDiff)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan, #00f0ff)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
              >
                <Code size={12} />
                <span>{showCodeDiff ? 'Zafiyetli Kodu Göster' : 'Düzeltilmiş Kodu Gör'}</span>
              </button>
            )}
          </div>

          {/* Code Viewer Box */}
          <div style={{
            background: 'var(--bg-input, #090e1a)',
            border: '1px solid var(--border-subtle, #1e293b)',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'var(--bg-dark, #0a0f1d)',
              borderBottom: '1px solid var(--border-subtle, #1e293b)',
              fontSize: '10px',
              color: 'var(--text-dim, #64748b)',
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Code size={11} color="var(--accent-cyan)" />
                {showCodeDiff ? '🛡️ DÜZELTİLMİŞ GÜVENLİ EXPRESS KODU' : '🚨 ZAFİYETLİ EXPRESS BACKEND KODU'}
              </span>
              <span>hotel-server.js</span>
            </div>
            <pre style={{
              margin: 0,
              padding: '10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-green, #00ff9d)',
              lineHeight: 1.5,
              overflowX: 'auto'
            }}>
              {showCodeDiff && question.fixedCode ? question.fixedCode : question.vulnerableCode}
            </pre>
          </div>

          {/* Question Text */}
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            background: 'var(--bg-card, #0f172a)',
            border: '1px solid var(--border-subtle, #1e293b)',
            marginBottom: '10px'
          }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-main, #f8fafc)', lineHeight: 1.5 }}>
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {question.options.map((opt) => {
              const isSelected = userAnswers[question.id] === opt.key;
              return (
                <div
                  key={opt.key}
                  onClick={() => handleSelectOption(opt.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '9px 12px',
                    background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'var(--bg-card, #0f172a)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-cyan, #00f0ff)' : 'var(--border-subtle, #1e293b)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 12px rgba(0, 240, 255, 0.2)' : 'none'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    background: isSelected ? 'var(--accent-cyan, #00f0ff)' : 'var(--bg-input, #090e1a)',
                    color: isSelected ? '#000' : 'var(--text-dim, #64748b)',
                    flexShrink: 0
                  }}>
                    {opt.key}
                  </div>
                  <div style={{
                    flex: 1,
                    fontSize: '11.5px',
                    lineHeight: 1.5,
                    color: isSelected ? '#ffffff' : 'var(--text-muted, #94a3b8)'
                  }}>
                    {opt.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Results View */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px', overflowY: 'auto' }}>
          <div style={{
            background: results.isPass ? 'linear-gradient(135deg, rgba(0, 255, 157, 0.15) 0%, rgba(0, 240, 255, 0.1) 100%)' : 'linear-gradient(135deg, rgba(255, 51, 102, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: `1px solid ${results.isPass ? 'var(--border-accent)' : 'rgba(255, 51, 102, 0.5)'}`,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              {results.isPass ? (
                <CheckCircle2 size={24} color="var(--accent-green, #00ff9d)" />
              ) : (
                <AlertTriangle size={24} color="var(--accent-red, #ff3366)" />
              )}
              <h3 style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 900,
                letterSpacing: '0.5px',
                color: results.isPass ? 'var(--accent-green, #00ff9d)' : 'var(--accent-red, #ff3366)',
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)'
              }}>
                {results.isPass ? 'TEBRİKLER! TESTİ GEÇTİNİZ (PASS)' : 'BAŞARISIZ! TEKRAR DENEYİN (FAIL)'}
              </h3>
            </div>

            <p style={{ margin: '0 auto', maxWidth: '440px', fontSize: '11px', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
              {results.isPass
                ? 'Grand Horizon Otel sistemindeki BOLA/IDOR, Mass Assignment ve Broken Access Control zafiyetlerini başarıyla tespit ettiniz.'
                : '10 soru üzerinden en az 7 doğru yanıt vermeniz gerekiyordu. Aşağıdaki çözümleri inceleyin ve tekrar deneyin.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--text-dim, #64748b)', display: 'block', fontFamily: 'var(--font-mono)' }}>DOĞRU</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-green, #00ff9d)', fontFamily: 'var(--font-mono)' }}>{results.correctCount}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--text-dim, #64748b)', display: 'block', fontFamily: 'var(--font-mono)' }}>YANLIŞ</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-red, #ff3366)', fontFamily: 'var(--font-mono)' }}>{results.wrongCount}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--text-dim, #64748b)', display: 'block', fontFamily: 'var(--font-mono)' }}>BAŞARI</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-cyan, #00f0ff)', fontFamily: 'var(--font-mono)' }}>%{results.scorePercent}</span>
              </div>
            </div>
          </div>

          {/* Question Explanations */}
          <div style={{ marginTop: '14px' }}>
            <h4 style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-main, #f8fafc)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              Soru Yanıtları & Zafiyet Raporu
            </h4>
            {questions.map((q, idx) => {
              const userOpt = userAnswers[q.id];
              const correctOpt = q.options.find(o => o.isCorrect)?.key;
              const isCorrect = userOpt === correctOpt;

              return (
                <div
                  key={q.id}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    background: isCorrect ? 'rgba(0, 255, 157, 0.05)' : 'rgba(255, 51, 102, 0.05)',
                    border: `1px solid ${isCorrect ? 'var(--border-accent)' : 'rgba(255, 51, 102, 0.3)'}`,
                    marginBottom: '8px',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--text-main, #f8fafc)' }}>#{idx + 1}. {q.title}</strong>
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      background: isCorrect ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 51, 102, 0.2)',
                      color: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}>
                      {isCorrect ? 'DOĞRU' : 'YANLIŞ'} (Seçim: {userOpt || 'Boş'} / Doğru: {correctOpt})
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-dim, #64748b)', lineHeight: 1.5, fontFamily: 'var(--font-ui)' }}>
                    <strong style={{ color: 'var(--accent-cyan)' }}>Çözüm:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        backgroundColor: 'var(--bg-dark, #0a0f1d)',
        borderTop: '1px solid var(--border-subtle, #1e293b)'
      }}>
        {!isSubmitted ? (
          <>
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: '6px 12px',
                borderRadius: '5px',
                background: 'var(--bg-card, #0f172a)',
                color: 'var(--text-muted, #94a3b8)',
                border: '1px solid var(--border-subtle, #1e293b)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: currentQuestionIndex > 0 ? 'pointer' : 'default',
                opacity: currentQuestionIndex === 0 ? 0.4 : 1
              }}
            >
              ← Önceki Soru
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                style={{
                  padding: '6px 14px',
                  borderRadius: '5px',
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 255, 157, 0.2) 100%)',
                  border: '1px solid var(--accent-cyan, #00f0ff)',
                  color: '#fff',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Sonraki Soru</span>
                <ArrowRight size={12} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={answeredCount === 0}
                style={{
                  padding: '6px 16px',
                  borderRadius: '5px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.25) 0%, rgba(0, 240, 255, 0.25) 100%)',
                  border: '1px solid var(--accent-green, #00ff9d)',
                  color: '#fff',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 15px rgba(0, 255, 157, 0.3)'
                }}
              >
                <ShieldCheck size={13} color="var(--accent-green)" />
                <span>SINAVI BİTİR (SONUCU GÖR)</span>
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleResetQuiz}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '5px',
              background: 'var(--bg-card, #0f172a)',
              color: 'var(--text-main, #f8fafc)',
              border: '1px solid var(--border-subtle, #1e293b)',
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={12} />
            <span>Sınavı Yeniden Başlat</span>
          </button>
        )}
      </div>
    </div>
  );
};
