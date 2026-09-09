// ============================================================
// Kisan Setu Chatbot Service — Intent Matching Engine
// Phase 1 — Pure keyword/string matching, no backend, no AI
// ============================================================

import {
  FAQ_KNOWLEDGE_BASE,
  FALLBACK_RESPONSE,
  PERSONAL_DATA_RESPONSE,
  ACTION_REQUEST_RESPONSE,
  SUGGESTED_QUESTIONS,
  type FaqItem,
  type ChatbotLanguage,
} from '../data/chatbotKnowledge';

// ─── Language Detection ──────────────────────────────────────
const HINDI_PATTERN = /[\u0900-\u097F]/; // Unicode range for Devanagari script

const HINGLISH_KEYWORDS = [
  'kya', 'hai', 'kaise', 'kahan', 'kyun', 'nahi', 'kar', 'aur', 'hoga',
  'mein', 'se', 'ko', 'ka', 'ki', 'ke', 'jo', 'yeh', 'wo', 'ek', 'do',
  'hoon', 'hain', 'tha', 'thi', 'hua', 'hui', 'bhi', 'par', 'pe', 'tak',
  'dena', 'lena', 'milna', 'jana', 'aana', 'karna', 'mila', 'gaya', 'aayi',
  'kitna', 'kitne', 'kaun', 'kab', 'kuch', 'sab', 'sirf', 'abhi', 'phir',
  'paisa', 'fasal', 'mandi', 'panjikaran', 'tokken', 'bhugtan', 'kisan',
  'shikayat', 'mujhe', 'mera', 'meri', 'mere', 'apna', 'apni', 'apne',
];

export function detectLanguage(input: string): ChatbotLanguage {
  if (!input || input.trim().length === 0) return 'english';

  // Detect native Hindi script
  if (HINDI_PATTERN.test(input)) return 'hindi';

  // Detect Hinglish (Latin script Hindi keywords)
  const lower = input.toLowerCase();
  const words = lower.split(/\s+/);
  let hinglishScore = 0;

  for (const word of words) {
    if (HINGLISH_KEYWORDS.some(kw => word === kw || word.startsWith(kw))) {
      hinglishScore++;
    }
  }

  // If more than 20% of words are Hinglish, treat as Hindi
  if (words.length > 0 && hinglishScore / words.length > 0.2) return 'hindi';

  return 'english';
}

// ─── Text Normalization ─────────────────────────────────────
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?!.,;:'"()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Personal Data Keywords ──────────────────────────────────
const PERSONAL_DATA_KEYWORDS = [
  'my payment', 'mera paisa', 'mera bhugtan', 'meri fasal', 'my crop status',
  'my balance', 'my account', 'check my', 'my money', 'show my', 'mujhe batao',
  'my transaction', 'my record', 'my token', 'mera token', 'mere records',
  'apna balance', 'apna paisa', 'my status', 'how much i got', 'kitna mila',
];

function isPersonalDataQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return PERSONAL_DATA_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Action Request Keywords ─────────────────────────────────
const ACTION_REQUEST_KEYWORDS = [
  'do it for me', 'please register me', 'register me', 'apply for me',
  'submit my crop', 'meri fasal submit karo', 'mera token book karo',
  'gate pass banao', 'payment karo', 'make payment', 'update my profile',
  'change my details', 'login kar do', 'please login', 'open my account',
];

function isActionRequest(input: string): boolean {
  const lower = input.toLowerCase();
  return ACTION_REQUEST_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Core Intent Matching ────────────────────────────────────
interface MatchResult {
  faq: FaqItem | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  type: 'normal' | 'personal_data' | 'action_request' | 'fallback';
}

function scoreEntry(entry: FaqItem, normalizedInput: string, words: string[]): number {
  let score = 0;

  // 1. Keyword match (most important)
  for (const kw of entry.keywords) {
    const normalizedKw = normalizeText(kw);
    if (normalizedInput.includes(normalizedKw)) {
      // Bonus for multi-word keyword match
      const kwWords = normalizedKw.split(' ');
      score += kwWords.length > 1 ? 3 : 1;
    }
  }

  // 2. Sample question match
  for (const q of entry.questions) {
    const normalizedQ = normalizeText(q);
    if (normalizedInput === normalizedQ) {
      score += 10; // Exact match
    } else if (normalizedInput.includes(normalizedQ) || normalizedQ.includes(normalizedInput)) {
      score += 5;
    } else {
      // Word overlap scoring
      const qWords = normalizedQ.split(' ');
      const overlap = qWords.filter(w => w.length > 2 && words.includes(w));
      score += overlap.length * 0.5;
    }
  }

  // 3. Intent keyword match
  const intentWords = entry.intent.split('_');
  for (const iw of intentWords) {
    if (iw.length > 2 && words.includes(iw)) {
      score += 0.5;
    }
  }

  // 4. Priority boost
  if (entry.priority) {
    score += entry.priority * 0.1;
  }

  return score;
}

export function matchIntent(userInput: string): MatchResult {
  if (!userInput || userInput.trim().length === 0) {
    return { faq: null, confidence: 'none', type: 'fallback' };
  }

  const trimmed = userInput.trim();

  // Check for special query types first
  if (isPersonalDataQuery(trimmed)) {
    return { faq: null, confidence: 'high', type: 'personal_data' };
  }

  if (isActionRequest(trimmed)) {
    return { faq: null, confidence: 'high', type: 'action_request' };
  }

  const normalized = normalizeText(trimmed);
  const words = normalized.split(' ').filter(w => w.length > 1);

  // Score all entries
  const scored = FAQ_KNOWLEDGE_BASE.map(entry => ({
    entry,
    score: scoreEntry(entry, normalized, words),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best || best.score === 0) {
    return { faq: null, confidence: 'none', type: 'fallback' };
  }

  let confidence: 'high' | 'medium' | 'low';
  if (best.score >= 5) {
    confidence = 'high';
  } else if (best.score >= 2) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Low confidence treated as fallback to prevent wrong answers
  if (confidence === 'low') {
    return { faq: null, confidence: 'low', type: 'fallback' };
  }

  return { faq: best.entry, confidence, type: 'normal' };
}

// ─── Response Builder ────────────────────────────────────────
export interface ChatbotResponse {
  message: string;
  language: ChatbotLanguage;
  faqId?: string;
  category?: string;
  type: 'answer' | 'personal_data' | 'action_request' | 'fallback';
}

export function getChatbotResponse(userInput: string): ChatbotResponse {
  const language = detectLanguage(userInput);
  const result = matchIntent(userInput);

  if (result.type === 'personal_data') {
    return {
      message: language === 'hindi'
        ? PERSONAL_DATA_RESPONSE.hindi
        : PERSONAL_DATA_RESPONSE.english,
      language,
      type: 'personal_data',
    };
  }

  if (result.type === 'action_request') {
    return {
      message: language === 'hindi'
        ? ACTION_REQUEST_RESPONSE.hindi
        : ACTION_REQUEST_RESPONSE.english,
      language,
      type: 'action_request',
    };
  }

  if (result.type === 'fallback' || !result.faq) {
    return {
      message: language === 'hindi'
        ? FALLBACK_RESPONSE.hindi
        : FALLBACK_RESPONSE.english,
      language,
      type: 'fallback',
    };
  }

  const faq = result.faq;
  // Use Hindi answer if: language is hindi AND hindi_answer exists
  const useHindi = language === 'hindi' && !!faq.hindi_answer;
  const message = useHindi ? faq.hindi_answer! : faq.answer;

  return {
    message,
    language,
    faqId: faq.faq_id,
    category: faq.category,
    type: 'answer',
  };
}

// ─── Suggested Questions ─────────────────────────────────────
export function getSuggestedQuestions(): string[] {
  return SUGGESTED_QUESTIONS;
}

// ─── Category Labels ─────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, { en: string; hi: string }> = {
  website_intro: { en: 'About Kisan Setu', hi: 'किसान सेतु के बारे में' },
  farmer_registration: { en: 'Registration', hi: 'पंजीकरण' },
  login_otp: { en: 'Login & OTP', hi: 'लॉगिन और OTP' },
  farmer_profile: { en: 'Farmer Profile', hi: 'किसान प्रोफ़ाइल' },
  crop_information: { en: 'Crop Information', hi: 'फसल जानकारी' },
  procurement: { en: 'Procurement', hi: 'खरीद' },
  weighment: { en: 'Weighment', hi: 'वजन/तौल' },
  gate_pass: { en: 'Gate Pass', hi: 'गेट पास' },
  payment: { en: 'Payment', hi: 'भुगतान' },
  transactions: { en: 'Transactions', hi: 'लेनदेन' },
  notifications: { en: 'Notifications', hi: 'सूचनाएँ' },
  centre_operator: { en: 'Mandi & Operator', hi: 'मंडी और ऑपरेटर' },
  troubleshooting: { en: 'Troubleshooting', hi: 'समस्या समाधान' },
  support_complaints: { en: 'Support & Complaints', hi: 'सहायता और शिकायत' },
  general: { en: 'General', hi: 'सामान्य' },
};
