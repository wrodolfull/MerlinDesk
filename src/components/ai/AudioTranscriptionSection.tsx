import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Mic, Play, Store as Stop, VolumeX, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AudioTranscriptionSectionProps {
  userSettings?: {
    openai_key?: string;
    elevenlabs_key?: string;
  };
  onTranscriptionComplete: (text: string) => void;
}

const AudioTranscriptionSection = ({
  userSettings,
  onTranscriptionComplete,
}: AudioTranscriptionSectionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(audioBlob);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    if (!userSettings?.openai_key) {
      toast.error('Please configure your OpenAI API key in Settings first');
      return;
    }

    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userSettings.openai_key}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      setTranscribedText(data.text);
      onTranscriptionComplete(data.text);
      toast.success('Audio transcribed successfully');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateAudio = async () => {
    if (!transcribedText) return;
    if (!userSettings?.elevenlabs_key) {
      toast.error('Please configure your ElevenLabs API key in Settings first');
      return;
    }

    try {
      setIsGeneratingAudio(true);
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': userSettings.elevenlabs_key,
        },
        body: JSON.stringify({
          text: transcribedText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) throw new Error('Audio generation failed');

      const audioBlob = await response.blob();
      setAudioBlob(audioBlob);
      toast.success('Audio generated successfully');
    } catch (error) {
      console.error('Audio generation error:', error);
      toast.error('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={isRecording ? 'error' : 'primary'}
              onClick={isRecording ? stopRecording : startRecording}
              leftIcon={isRecording ? <Stop size={16} /> : <Mic size={16} />}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>

            {audioBlob && (
              <>
                <Button
                  variant="outline"
                  onClick={isPlaying ? stopAudio : playAudio}
                  leftIcon={isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
                <Button
                  onClick={transcribeAudio}
                  isLoading={isTranscribing}
                >
                  Transcribe
                </Button>
              </>
            )}
          </div>

          {transcribedText && (
            <div className="space-y-2">
              <textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Button
                onClick={generateAudio}
                isLoading={isGeneratingAudio}
                leftIcon={<Play size={16} />}
              >
                Generate Audio
              </Button>
            </div>
          )}

          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioTranscriptionSection;