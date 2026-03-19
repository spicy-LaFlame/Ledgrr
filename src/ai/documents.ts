import * as pdfjsLib from 'pdfjs-dist';
import type { DocumentChunk } from '../db/schema';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const CHARS_PER_CHUNK = 3000; // ~750-1000 tokens
const CHUNK_OVERLAP = 300;    // Overlap between chunks for context continuity

/**
 * Extract text from a PDF file client-side.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }

  return pages.join('\n\n');
}

/**
 * Split text into chunks for long documents.
 * Short docs (under threshold) return a single chunk.
 */
export function chunkText(text: string): DocumentChunk[] {
  if (text.length <= CHARS_PER_CHUNK) {
    return [{ index: 0, text }];
  }

  const chunks: DocumentChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    let end = start + CHARS_PER_CHUNK;

    // Try to break at a paragraph or sentence boundary
    if (end < text.length) {
      const nextParagraph = text.indexOf('\n\n', end - 200);
      if (nextParagraph !== -1 && nextParagraph <= end + 200) {
        end = nextParagraph;
      } else {
        const nextSentence = text.indexOf('. ', end - 100);
        if (nextSentence !== -1 && nextSentence <= end + 100) {
          end = nextSentence + 2;
        }
      }
    } else {
      end = text.length;
    }

    chunks.push({
      index,
      text: text.slice(start, end).trim(),
    });

    index++;
    start = Math.max(start + 1, end - CHUNK_OVERLAP);
  }

  return chunks;
}

/**
 * Find the most relevant chunks for a given question using keyword matching.
 */
export function findRelevantChunks(
  chunks: DocumentChunk[],
  question: string,
  maxChunks: number = 5
): DocumentChunk[] {
  if (chunks.length <= maxChunks) return chunks;

  const keywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !['what', 'when', 'where', 'which', 'about', 'does', 'have', 'this', 'that', 'with', 'from', 'they', 'been', 'were'].includes(w));

  const scored = chunks.map(chunk => {
    const lowerText = chunk.text.toLowerCase();
    let score = 0;
    for (const keyword of keywords) {
      const count = (lowerText.match(new RegExp(keyword, 'g')) ?? []).length;
      score += count;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxChunks).map(s => s.chunk);
}

/**
 * Check if a question likely references agreements/contracts.
 */
export function isAgreementQuery(question: string): boolean {
  const keywords = [
    'agreement', 'contract', 'eligible', 'reporting', 'deadline',
    'deliverable', 'milestone', 'requirement', 'clause', 'term',
    'budget line', 'allowable', 'expense', 'can we', 'are we allowed',
    'due date', 'report due', 'submit', 'compliance', 'obligation',
  ];
  const lower = question.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}
