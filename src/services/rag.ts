// ============================================================
// RAG Service — Regulations & AI Compliance
// TODO: Connect to vector store (pgvector / Pinecone)
// TODO: Connect to OpenAI embeddings + chat completions
// ============================================================
import type { RegulatoryDocument, RAGQuery } from '@/types';
import { mockRegulations, mockRAGQueries } from '@/data/index';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getRegulations(): Promise<RegulatoryDocument[]> {
  await delay(300);
  // TODO: supabase.from('regulatory_documents').select('*')
  return mockRegulations;
}

export async function queryRAG(question: string): Promise<RAGQuery> {
  await delay(2000);
  // TODO: POST to /api/rag/query { question }
  // 1. Embed question with OpenAI text-embedding-3-small
  // 2. Vector search in pgvector for relevant chunks
  // 3. Send to GPT-4o with context for answer
  // 4. Run compliance check against checklist
  return {
    ...mockRAGQueries[0],
    id: `rq${Date.now()}`,
    question,
    created_at: new Date().toISOString(),
    status: 'done',
  };
}

export async function uploadDocument(file: File): Promise<RegulatoryDocument> {
  await delay(1500);
  // TODO: Upload to Supabase Storage
  // TODO: Trigger background job to parse PDF and create vector embeddings
  throw new Error('Not implemented — connect Supabase Storage and document parser');
}

export async function getRAGHistory(): Promise<RAGQuery[]> {
  await delay(300);
  // TODO: supabase.from('rag_queries').select('*').order('created_at', { ascending: false })
  return mockRAGQueries;
}
