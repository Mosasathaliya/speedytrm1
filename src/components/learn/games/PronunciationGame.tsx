'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, Play, Square, Volume2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PronunciationGame } from '@/types/comprehensive-learning';

interface PronunciationGameProps {
  gameData: PronunciationGame;
  onComplete: (score: number) => void;
}

interface RecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

interface WordState {
  word: string;
  attempts: number;
  bestScore: number;
  completed: boolean;
}

const PronunciationGame: React.FC<PronunciationGameProps> = ({
  gameData,
  onComplete
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordStates, setWordStates] = useState<WordState[]>(
    gameData.words.map(word => ({
      word: word.text,
      attempts: 0,
      bestScore: 0,
      completed: false
    }))
  );
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPlaying: false,
    audioBlob: null,
    audioUrl: null
  });
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
    show: boolean;
  }>({ score: 0, feedback: '', show: false });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentWord = gameData.words[currentWordIndex];
  const currentWordState = wordStates[currentWordIndex];

  useEffect(() => {
    return () => {
      if (recording.audioUrl) {
        URL.revokeObjectURL(recording.audioUrl);
      }
    };
  }, [recording.audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecording(prev => ({ ...prev, audioBlob: blob, audioUrl: url }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording.isRecording) {
      mediaRecorderRef.current.stop();
      setRecording(prev => ({ ...prev, isRecording: false }));
    }
  };

  const playRecording = () => {
    if (recording.audioUrl) {
      const audio = new Audio(recording.audioUrl);
      setRecording(prev => ({ ...prev, isPlaying: true }));
      audio.play();
      audio.onended = () => {
        setRecording(prev => ({ ...prev, isPlaying: false }));
      };
    }
  };

  const playTargetAudio = async () => {
    try {
      const response = await fetch('/api/ai/pronounce-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentWord.text })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Pronunciation error:', error);
    }
  };

  const submitPronunciation = async () => {
    if (!recording.audioBlob) return;

    try {
      // Simulate pronunciation assessment (in real app, use speech recognition API)
      const mockScore = Math.random() * 40 + 60; // 60-100 range
      const score = Math.round(mockScore);
      
      let feedbackText = '';
      if (score >= 90) feedbackText = 'Excellent pronunciation! Perfect!';
      else if (score >= 80) feedbackText = 'Very good! Almost perfect.';
      else if (score >= 70) feedbackText = 'Good pronunciation. Keep practicing.';
      else feedbackText = 'Keep trying! Listen to the example again.';

      setFeedback({ score, feedback: feedbackText, show: true });

      // Update word state
      setWordStates(prev => prev.map((state, index) => 
        index === currentWordIndex
          ? {
              ...state,
              attempts: state.attempts + 1,
              bestScore: Math.max(state.bestScore, score),
              completed: score >= gameData.targetAccuracy
            }
          : state
      ));

      // Check if game completed
      const updatedStates = [...wordStates];
      updatedStates[currentWordIndex] = {
        ...updatedStates[currentWordIndex],
        attempts: updatedStates[currentWordIndex].attempts + 1,
        bestScore: Math.max(updatedStates[currentWordIndex].bestScore, score),
        completed: score >= gameData.targetAccuracy
      };

      if (updatedStates.every(state => state.completed)) {
        setTimeout(() => {
          const averageScore = updatedStates.reduce((sum, state) => sum + state.bestScore, 0) / updatedStates.length;
          onComplete(Math.round(averageScore));
        }, 2000);
      }

    } catch (error) {
      console.error('Error submitting pronunciation:', error);
    }
  };

  const nextWord = () => {
    if (currentWordIndex < gameData.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setRecording({ isRecording: false, isPlaying: false, audioBlob: null, audioUrl: null });
      setFeedback({ score: 0, feedback: '', show: false });
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setRecording({ isRecording: false, isPlaying: false, audioBlob: null, audioUrl: null });
      setFeedback({ score: 0, feedback: '', show: false });
    }
  };

  const resetWord = () => {
    setRecording({ isRecording: false, isPlaying: false, audioBlob: null, audioUrl: null });
    setFeedback({ score: 0, feedback: '', show: false });
  };

  const getOverallProgress = () => {
    const completedWords = wordStates.filter(state => state.completed).length;
    return (completedWords / wordStates.length) * 100;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              🎤 Pronunciation Practice
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Word {currentWordIndex + 1}/{gameData.words.length}
              </Badge>
              <Badge variant="outline">
                Target: {gameData.targetAccuracy}%
              </Badge>
            </div>
          </div>
          <Progress value={getOverallProgress()} className="h-3" />
        </CardHeader>
      </Card>

      {/* Main Practice Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Word Display */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-center text-lg">🎯 Practice Word</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary animate-pulse">
                {currentWord.text}
              </div>
              <div className="text-lg text-muted-foreground font-mono">
                /{currentWord.phonetic}/
              </div>
              <Badge 
                variant={currentWord.difficulty <= 3 ? "secondary" : currentWord.difficulty <= 7 ? "default" : "destructive"}
                className="text-sm"
              >
                Difficulty: {currentWord.difficulty}/10
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                onClick={playTargetAudio}
                className="w-full h-12 text-lg"
                variant="outline"
              >
                <Volume2 className="h-5 w-5 mr-2" />
                Listen to Example
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={previousWord}
                  disabled={currentWordIndex === 0}
                  variant="outline"
                >
                  ← Previous
                </Button>
                <Button
                  onClick={nextWord}
                  disabled={currentWordIndex === gameData.words.length - 1}
                  variant="outline"
                >
                  Next →
                </Button>
              </div>
            </div>

            {/* Word Stats */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attempts:</span>
                <span>{currentWordState.attempts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Best Score:</span>
                <span className={cn(
                  "font-medium",
                  currentWordState.bestScore >= gameData.targetAccuracy ? "text-green-600" : "text-orange-600"
                )}>
                  {currentWordState.bestScore}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <span className={cn(
                  "font-medium flex items-center gap-1",
                  currentWordState.completed ? "text-green-600" : "text-orange-600"
                )}>
                  {currentWordState.completed ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Practice More
                    </>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recording Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">🎙️ Your Recording</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Button
                  onClick={recording.isRecording ? stopRecording : startRecording}
                  className={cn(
                    "w-20 h-20 rounded-full text-white transition-all duration-300",
                    recording.isRecording 
                      ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                      : "bg-blue-500 hover:bg-blue-600 hover:scale-110"
                  )}
                >
                  {recording.isRecording ? (
                    <Square className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
                {recording.isRecording && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {recording.isRecording 
                  ? "Recording... Click to stop" 
                  : "Click to start recording"}
              </p>
            </div>

            {recording.audioUrl && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-center text-muted-foreground mb-3">
                    Your Recording
                  </p>
                  <Button
                    onClick={playRecording}
                    disabled={recording.isPlaying}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {recording.isPlaying ? "Playing..." : "Play Recording"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={submitPronunciation}
                    className="w-full"
                    disabled={!recording.audioBlob}
                  >
                    Check Pronunciation
                  </Button>
                  <Button
                    onClick={resetWord}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback.show && (
              <Card className={cn(
                "animate-fade-in border-2",
                feedback.score >= gameData.targetAccuracy 
                  ? "border-green-400 bg-green-50 dark:bg-green-950" 
                  : "border-orange-400 bg-orange-50 dark:bg-orange-950"
              )}>
                <CardContent className="p-4 text-center">
                  <div className={cn(
                    "text-3xl font-bold mb-2",
                    feedback.score >= gameData.targetAccuracy ? "text-green-600" : "text-orange-600"
                  )}>
                    {feedback.score}%
                  </div>
                  <p className="text-sm font-medium mb-2">{feedback.feedback}</p>
                  {feedback.score >= gameData.targetAccuracy ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm">Target Achieved!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-orange-600">
                      <XCircle className="h-5 w-5" />
                      <span className="text-sm">Keep practicing!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {wordStates.map((state, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all cursor-pointer",
                  index === currentWordIndex ? "ring-2 ring-primary" : "",
                  state.completed 
                    ? "border-green-400 bg-green-50 dark:bg-green-950" 
                    : state.attempts > 0 
                      ? "border-orange-400 bg-orange-50 dark:bg-orange-950"
                      : "border-muted"
                )}
                onClick={() => setCurrentWordIndex(index)}
              >
                <div className="text-center">
                  <div className="font-medium text-sm">{gameData.words[index].text}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {state.bestScore > 0 ? `${state.bestScore}%` : '-'}
                  </div>
                  <div className="mt-1">
                    {state.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    ) : state.attempts > 0 ? (
                      <XCircle className="h-4 w-4 text-orange-600 mx-auto" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-muted rounded-full mx-auto" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PronunciationGame;
