import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Mic, MicOff, Square, Volume2, VolumeX, Settings2, PlayCircle, MessageSquare, Send, SkipForward, 
  CheckCircle2, AlertTriangle, Lightbulb, ChevronRight, BarChart, Building2, Briefcase, Zap, Star,
  Sparkles, Info, RotateCcw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import ProgressBar from '../components/ProgressBar';
import CircularProgress from '../components/CircularProgress';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

const InterviewPrep = () => {
  const { activeJobMatchId, setActiveJobMatchId } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const [appState, setAppState] = useState('setup'); // setup, generating, interview, evaluating, results
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const targetMatchId = location.state?.jobMatchId || activeJobMatchId;
  const [selectedMatchId, setSelectedMatchId] = useState(targetMatchId || '');
  
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  // Voice Recording and Speech Recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceError, setVoiceError] = useState('');
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);

  // Audio Database persistence states
  const [audioRecords, setAudioRecords] = useState({}); // Question ID -> Base64 Data URL for DB
  const [audioPreviews, setAudioPreviews] = useState({}); // Question ID -> Object URL for UI playback
  const [audioDurations, setAudioDurations] = useState({}); // Question ID -> duration seconds

  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const baseTextRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentQIdRef = useRef(null);
  const recordingDurationRef = useRef(0);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  const stopQuestionAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingQuestion(false);
  }, []);

  const toggleQuestionAudio = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingQuestion) {
      stopQuestionAudio();
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingQuestion(false);
      utterance.onerror = () => setIsPlayingQuestion(false);
      setIsPlayingQuestion(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [isPlayingQuestion, stopQuestionAudio]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    setVoiceError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    stopQuestionAudio();
    baseTextRef.current = currentAnswer;

    const currentQ = questions[currentQIdx];
    const activeQId = currentQ?.id;
    currentQIdRef.current = activeQId;

    // Start Audio Stream & MediaRecorder for database storage
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        let options = {};
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options = { mimeType: 'audio/webm;codecs=opus' };
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            options = { mimeType: 'audio/webm' };
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
          }
        }

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const finalMime = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
          const previewUrl = URL.createObjectURL(audioBlob);
          const durationVal = recordingDurationRef.current || 1;

          if (activeQId) {
            setAudioPreviews(prev => ({ ...prev, [activeQId]: previewUrl }));
            setAudioDurations(prev => ({ ...prev, [activeQId]: durationVal }));

            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Data = reader.result;
              if (base64Data) {
                setAudioRecords(prev => ({ ...prev, [activeQId]: base64Data }));
              }
            };
            reader.readAsDataURL(audioBlob);
          }

          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          mediaStreamRef.current = null;
        };

        mediaRecorder.start(250);
      } catch (mediaErr) {
        console.warn("Could not start MediaRecorder for audio recording:", mediaErr);
      }
    }

    // Start SpeechRecognition for real-time text transcription
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isRecordingRef.current = true;
        setIsRecording(true);
        setRecordingDuration(0);
        recordingDurationRef.current = 0;
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
          setRecordingDuration(d => {
            recordingDurationRef.current = d + 1;
            return d + 1;
          });
        }, 1000);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + ' ';
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const prefix = baseTextRef.current ? baseTextRef.current.trim() + ' ' : '';
        const updated = prefix + finalTranscript + interimTranscript;
        setCurrentAnswer(updated);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission denied. Please allow microphone access in your browser settings.');
          stopRecording();
        } else if (event.error === 'audio-capture') {
          setVoiceError('No microphone detected. Please connect an audio input device.');
          stopRecording();
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            stopRecording();
          }
        } else {
          stopRecording();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setVoiceError('Could not start microphone: ' + (err.message || 'Unknown error'));
      stopRecording();
    }
  }, [currentAnswer, currentQIdx, questions, stopQuestionAudio, stopRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
      stopQuestionAudio();
    };
  }, [stopRecording, stopQuestionAudio]);

  const tok = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/matches');
        const matchData = res.data || [];
        setMatches(matchData);
        
        if (matchData.length > 0) {
          const defaultMatchId = targetMatchId && matchData.some(m => m.id === targetMatchId)
            ? targetMatchId
            : matchData[0].id;
          setSelectedMatchId(defaultMatchId);
          if (setActiveJobMatchId && !activeJobMatchId) {
            setActiveJobMatchId(defaultMatchId);
          }
        }
      } catch (err) {
        console.error("Failed to load matches", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, [targetMatchId]);

  const handleGenerate = async () => {
    if (!selectedMatchId && matches.length === 0) {
      setError("Please select a target job first.");
      return;
    }
    
    setAppState('generating');
    setError('');
    
    try {
      const match = matches.find(m => m.id === selectedMatchId) || matches[0];
      if (!match) {
        setError("No job match found. Please analyze a job first.");
        setAppState('setup');
        return;
      }
      
      const targetRole = `${match.targetJob?.company || 'Company'} - ${match.targetJob?.jobTitle || 'Role'}`;
      const focusAreas = [...(match.matchedSkills || []), ...(match.missingSkills || [])].slice(0, 5);
      if (focusAreas.length === 0) {
        focusAreas.push("General Engineering", "Problem Solving", "System Architecture");
      }
      
      const payload = { role: targetRole, focusAreas, jobMatchId: match.id };
      const res = await api.post('/interviews/generate', payload);
      
      setInterviewId(res.data.id);
      setQuestions(res.data.questions || []);
      setCurrentQIdx(0);
      setAnswers({});
      setCurrentAnswer('');
      setAudioRecords({});
      setAudioPreviews({});
      setAudioDurations({});
      setAppState('interview');
    } catch (err) {
      console.error("Failed to generate interview", err);
      setError("Failed to generate interview. Please try again.");
      setAppState('setup');
    }
  };

  const handleNextQuestion = () => {
    stopRecording();
    stopQuestionAudio();
    if (!currentAnswer.trim()) return;
    
    const currentQ = questions[currentQIdx];
    if (currentQ) {
      setAnswers(prev => ({ ...prev, [currentQ.id]: currentAnswer }));
    }
    
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(i => i + 1);
      const nextQ = questions[currentQIdx + 1];
      setCurrentAnswer(nextQ ? (answers[nextQ.id] || '') : '');
    } else {
      handleEvaluate();
    }
  };

  const handleEvaluate = async () => {
    stopRecording();
    stopQuestionAudio();
    setAppState('evaluating');
    try {
      const currentQ = questions[currentQIdx];
      const currentAnswersMap = currentQ 
        ? { ...answers, [currentQ.id]: currentAnswer } 
        : answers;
      
      const res = await api.post(`/interviews/${interviewId}/evaluate`, { 
        answers: currentAnswersMap,
        audioData: audioRecords,
        audioDurations: audioDurations
      });
      
      setEvaluation(res.data);
      setAppState('results');
    } catch (err) {
      console.error("Failed to evaluate interview", err);
      setError("Failed to evaluate interview.");
      setAppState('interview');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading text="Loading interview configurations..." />
      </div>
    );
  }

  if (!isLoading && matches.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pt-6">
        <EmptyState 
          icon={Mic}
          title="Job Analysis Required" 
          description="AI Mock Interviews are tailored to your target jobs and identified skill gaps. Please analyze a job first." 
          action={
            <Button onClick={() => navigate('/dashboard/jobs')}>
              Go to Job Analyzer
            </Button>
          }
        />
      </div>
    );
  }

  if (appState === 'setup') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">AI Interview Simulator</h1>
          <p className="text-slate-500 mt-2 text-lg">Practice tailored HR and Technical questions for your specific job matches.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md">
            <p className="text-rose-700">{error}</p>
          </div>
        )}

        <Card className="border-slate-200 shadow-sm max-w-2xl mx-auto">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-indigo-600" />
              Interview Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Job (From Job Analyzer)</label>
              {matches.length > 0 ? (
                <Select 
                  value={selectedMatchId} 
                  onChange={(e) => {
                    setSelectedMatchId(e.target.value);
                    if (setActiveJobMatchId) setActiveJobMatchId(e.target.value);
                  }}
                >
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.targetJob?.jobTitle || 'Role'} at {m.targetJob?.company || 'Company'} (Match: {m.overallScore || 0}%)
                    </option>
                  ))}
                </Select>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                  No jobs analyzed yet. Please run the Job Analyzer first to generate a target role.
                </div>
              )}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
              <Zap className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-900">
                <p className="font-semibold mb-1">How it works</p>
                <p>We use the company profile and required skills from your selected job match to generate highly specific Technical, Scenario, and Behavioral questions. Answer them to receive AI grading, expected answers, and feedback.</p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleGenerate} 
              disabled={matches.length === 0} 
              rightIcon={<PlayCircle className="h-5 w-5" />}
            >
              Generate Mock Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appState === 'generating' || appState === 'evaluating') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
         <div className="relative mx-auto w-20 h-20">
            <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="h-8 w-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {appState === 'generating' ? 'Generating Custom Interview' : 'Evaluating Your Answers'}
          </h2>
          <p className="text-slate-500">
            {appState === 'generating' 
              ? 'Our AI is analyzing the company profile and required skills to draft targeted questions...' 
              : 'Our AI is carefully reviewing your technical correctness, clarity, and communication style...'}
          </p>
      </div>
    );
  }

  if (appState === 'interview') {
    const q = questions[currentQIdx];
    const isLast = currentQIdx === questions.length - 1;
    
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-10">
          <div>
            <h2 className="font-bold text-slate-900">Question {currentQIdx + 1} of {questions.length}</h2>
            <ProgressBar value={((currentQIdx) / questions.length) * 100} colorClass="bg-indigo-600" className="mt-2 w-32" />
          </div>
        </div>

        <Card className="border-indigo-100 shadow-sm">
          <CardContent className="p-8">
            <div className="mb-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <Badge variant="primary" className="text-xs font-semibold uppercase tracking-wide">
                  Interview Question
                </Badge>

                {/* Text-to-Speech Question Reader */}
                {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                  <button
                    type="button"
                    onClick={() => toggleQuestionAudio(q?.questionText || '')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isPlayingQuestion
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 ring-2 ring-indigo-200'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200'
                    }`}
                    title={isPlayingQuestion ? "Stop reading question" : "Listen to question being read aloud"}
                  >
                    {isPlayingQuestion ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                        <span>Stop Question Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Listen to Question</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed">
                {q?.questionText || 'Loading question...'}
              </h2>
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span>Your Answer</span>
                    <span className="text-xs font-normal text-slate-500 hidden sm:inline">(Type or speak your answer)</span>
                  </label>
                </div>

                {/* Voice Recording Controls */}
                <div className="flex items-center gap-2">
                  {speechSupported ? (
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                        isRecording 
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 shadow-md ring-2 ring-rose-400/50' 
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                      title={isRecording ? "Click to stop recording" : "Click to speak your answer into the microphone"}
                    >
                      {isRecording ? (
                        <>
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                          </span>
                          <Square className="h-3.5 w-3.5 fill-current" />
                          <span>Stop Recording ({formatDuration(recordingDuration)})</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 text-indigo-600" />
                          <span>Voice Record Answer</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      <MicOff className="h-3.5 w-3.5" /> Voice not supported
                    </span>
                  )}

                  {currentAnswer.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isRecording) stopRecording();
                        setCurrentAnswer('');
                        const curId = questions[currentQIdx]?.id;
                        if (curId) {
                          setAudioPreviews(prev => { const n = { ...prev }; delete n[curId]; return n; });
                          setAudioRecords(prev => { const n = { ...prev }; delete n[curId]; return n; });
                          setAudioDurations(prev => { const n = { ...prev }; delete n[curId]; return n; });
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                      title="Clear current answer and voice recording"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Recording Waveform Banner */}
              {isRecording && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-rose-900 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 h-4">
                      <span className="w-1 bg-rose-600 rounded-full animate-bounce h-3"></span>
                      <span className="w-1 bg-rose-600 rounded-full animate-bounce h-5 [animation-delay:150ms]"></span>
                      <span className="w-1 bg-rose-600 rounded-full animate-bounce h-2 [animation-delay:300ms]"></span>
                      <span className="w-1 bg-rose-600 rounded-full animate-bounce h-4 [animation-delay:450ms]"></span>
                      <span className="w-1 bg-rose-600 rounded-full animate-bounce h-3 [animation-delay:200ms]"></span>
                    </div>
                    <span className="font-semibold text-rose-700">Listening to your voice...</span>
                    <span className="text-rose-600 hidden md:inline">Speak clearly into your microphone. Words are transcribed directly into your answer below.</span>
                  </div>
                  <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded border border-rose-200">
                    {formatDuration(recordingDuration)}
                  </span>
                </div>
              )}

              {voiceError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded text-xs text-rose-700 flex items-center justify-between">
                  <span>{voiceError}</span>
                  <button onClick={() => setVoiceError('')} className="font-bold ml-2 text-rose-500 hover:text-rose-700">×</button>
                </div>
              )}

              <div className="relative">
                <textarea 
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={8}
                  className={`w-full rounded-lg border p-4 text-slate-700 resize-y text-sm leading-relaxed transition-all ${
                    isRecording 
                      ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20' 
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                  placeholder="Type your answer, or click 'Voice Record Answer' to speak naturally (explain concepts, data structures, algorithms, Big-O complexities, and examples)..."
                ></textarea>
              </div>

              {/* Recorded Voice Audio Preview */}
              {audioPreviews[questions[currentQIdx]?.id] && (
                <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50/50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
                  <div className="flex items-center gap-2.5 text-xs text-indigo-950 dark:text-indigo-100 font-semibold">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                      <Volume2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span>Recorded Voice Answer</span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium ml-2 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] border border-emerald-200 dark:border-emerald-800">
                        ✓ Stored for Database
                      </span>
                    </div>
                  </div>
                  <audio controls src={audioPreviews[questions[currentQIdx]?.id]} className="h-8 max-w-full sm:max-w-xs" />
                </div>
              )}

              <div className="flex justify-between items-center text-xs">
                <span className={currentAnswer.trim().length === 0 ? "text-slate-400" : currentAnswer.trim().length < 40 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium flex items-center gap-1"}>
                  {currentAnswer.trim().length === 0 
                    ? "Tip: Speak or type detailed technical explanations to earn high marks and verified strengths."
                    : currentAnswer.trim().length < 40 
                    ? "💡 Note: Very short or minimal answers may not demonstrate strengths to the AI evaluator." 
                    : "✓ Good detail level"}
                </span>
                <span className="text-slate-400 font-mono">{currentAnswer.trim().length} chars</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button 
            size="lg" 
            onClick={handleNextQuestion} 
            disabled={!currentAnswer.trim()}
            rightIcon={isLast ? <CheckCircle2 className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          >
            {isLast ? 'Submit Interview' : 'Next Question'}
          </Button>
        </div>
      </div>
    );
  }

  if (appState === 'results' && evaluation) {
    const hasStrengths = evaluation.strengths && Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0;
    const hasWeaknesses = evaluation.weaknesses && Array.isArray(evaluation.weaknesses) && evaluation.weaknesses.length > 0;
    const overallScore = evaluation.overallScore || 0;

    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Interview Evaluation</h1>
          <p className="text-slate-500 mt-2 text-lg">Detailed feedback and sample answers for your AI mock interview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-slate-200 shadow-sm flex flex-col justify-center items-center p-8">
            <CircularProgress 
              value={overallScore} 
              size={180} 
              strokeWidth={14} 
              label="Overall Score"
              color={overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444"} 
            />
            <div className="mt-8 w-full">
              <Button className="w-full" onClick={() => setAppState('setup')} variant="outline">
                Practice Another
              </Button>
            </div>
          </Card>

          <Card className="md:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="h-5 w-5 text-indigo-600" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths Container */}
                {hasStrengths ? (
                  <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Strengths ({evaluation.strengths.length})
                      </h4>
                      <ul className="space-y-2.5">
                        {evaluation.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-emerald-800 flex items-start gap-2.5 leading-relaxed">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-slate-400" /> Strengths
                      </h4>
                      <div className="bg-white rounded-md p-3.5 border border-slate-200 text-xs text-slate-600 space-y-2 mt-2">
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          No strengths demonstrated in this attempt
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                          Because no substantive technical answers were provided, strengths could not be verified. To earn strengths, provide detailed explanations, time/space complexity, and practical examples.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-indigo-600 font-medium flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Practice again with detailed answers to build strengths!
                    </div>
                  </div>
                )}
                
                {/* Areas for Improvement Container */}
                {hasWeaknesses ? (
                  <div className="bg-amber-50 rounded-lg p-5 border border-amber-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" /> Areas for Improvement ({evaluation.weaknesses.length})
                      </h4>
                      <ul className="space-y-2.5">
                        {evaluation.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm text-amber-800 flex items-start gap-2.5 leading-relaxed">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></div>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Areas for Improvement
                      </h4>
                      <p className="text-xs text-emerald-700 mt-2 bg-white p-3 rounded border border-emerald-100">
                        No major improvement areas detected. Solid technical answers provided across all questions!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actionable Advice to Build Strengths */}
              {overallScore < 60 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 flex items-start gap-4">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <h4 className="font-bold text-slate-900 text-sm">How to Earn Verified Strengths in Technical Interviews</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The AI simulator grades based on technical accuracy, edge cases, and clarity. Follow this 3-step formula to turn improvement areas into recognized strengths:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="bg-white/90 p-3 rounded-lg border border-indigo-100 text-xs shadow-xs">
                        <span className="font-semibold text-indigo-900 block mb-1">1. State Definition</span>
                        <span className="text-slate-500 leading-relaxed">Explain what the concept is and how its internal data structures work.</span>
                      </div>
                      <div className="bg-white/90 p-3 rounded-lg border border-indigo-100 text-xs shadow-xs">
                        <span className="font-semibold text-indigo-900 block mb-1">2. Complexity Analysis</span>
                        <span className="text-slate-500 leading-relaxed">Always state Big-O for average and worst case lookup, insert, and delete.</span>
                      </div>
                      <div className="bg-white/90 p-3 rounded-lg border border-indigo-100 text-xs shadow-xs">
                        <span className="font-semibold text-indigo-900 block mb-1">3. Practical Example</span>
                        <span className="text-slate-500 leading-relaxed">Provide an industry use case or code pattern demonstrating it in action.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Question Breakdown & Expected Answers</h3>
        
        <div className="space-y-6">
          {evaluation.questions?.map((q, i) => {
            const qScore = (q.score !== null && q.score !== undefined) 
              ? q.score 
              : (evaluation.overallScore !== null && evaluation.overallScore !== undefined ? evaluation.overallScore : 0);

            return (
              <Card key={i} className="border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start gap-4">
                  <h4 className="font-semibold text-slate-900 text-lg leading-snug">Q{i+1}: {q.questionText}</h4>
                  <Badge 
                    variant={qScore >= 80 ? 'success' : qScore >= 60 ? 'warning' : 'danger'} 
                    className="shrink-0 text-sm px-3 py-1 font-semibold"
                  >
                    {qScore}/100
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Your Answer</span>
                        {(!q.userAnswer || !q.userAnswer.trim()) && (
                          <span className="text-rose-500 font-normal lowercase">(not answered)</span>
                        )}
                      </h5>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap text-sm min-h-[90px]">
                        {q.userAnswer && q.userAnswer.trim().length > 0 ? (
                          q.userAnswer
                        ) : (
                          <span className="text-slate-400 italic">No answer provided</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Star className="h-4 w-4" /> Expected / Sample Answer
                      </h5>
                      <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/80 text-indigo-950 dark:text-indigo-100 whitespace-pre-wrap text-sm leading-relaxed min-h-[90px]">
                        {q.expectedAnswer}
                      </div>
                    </div>
                    
                  </div>

                  {/* Saved Voice Recording Player from Database */}
                  {(q.audioUrl || audioPreviews[q.id]) && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0">
                          <Mic className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Voice Recording
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                              Saved in DB
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Spoken answer recorded and stored in database {q.audioDuration ? `(${formatDuration(q.audioDuration)})` : ''}
                          </p>
                        </div>
                      </div>
                      <audio controls src={q.audioUrl || audioPreviews[q.id]} className="h-8 max-w-full sm:max-w-xs" />
                    </div>
                  )}

                  <div className="mt-5 bg-amber-50/70 p-4 rounded-lg border border-amber-200/60 flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="w-full">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">AI Evaluator Feedback</span>
                      <p className="text-amber-950 dark:text-amber-100 text-sm leading-relaxed">
                        {q.feedback || evaluation.suggestions || (qScore === 0 
                          ? "No substantive technical answer was provided to demonstrate proficiency on this question. Review the sample answer above to learn the expected concepts, complexity analysis, and implementation details."
                          : "Review the sample answer above to compare with your submission.")}
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    );
  }

  return null;
};

export default InterviewPrep;
