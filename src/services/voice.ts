// ============================================================
// Voice Service — Speech-to-Task
// TODO: Connect to OpenAI Whisper or Deepgram STT API
// TODO: Connect to AI task parser
// ============================================================
import type { VoiceTranscription, ParsedTask } from '@/types';
import { mockVoiceTranscription } from '@/data/index';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  await delay(2000);
  // TODO: POST audioBlob to /api/voice/transcribe
  // TODO: Use OpenAI Whisper: openai.audio.transcriptions.create({ file, model: 'whisper-1' })
  return mockVoiceTranscription.transcript;
}

export async function parseTranscriptToTasks(transcript: string): Promise<ParsedTask[]> {
  await delay(1500);
  // TODO: POST to /api/ai/parse-tasks { transcript }
  // TODO: Use GPT-4o with structured output to extract tasks, assignees, deadlines
  return mockVoiceTranscription.parsed_tasks;
}

export async function getVoiceTranscriptions(): Promise<VoiceTranscription[]> {
  await delay(300);
  // TODO: supabase.from('voice_transcriptions').select('*').order('created_at', { ascending: false })
  return [mockVoiceTranscription];
}

export async function processVoiceCommand(audioBlob: Blob): Promise<VoiceTranscription> {
  await delay(3000);
  // TODO: Full pipeline: transcribe → parse → create tasks → notify assignees
  return {
    ...mockVoiceTranscription,
    id: `vt${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'parsed',
  };
}
