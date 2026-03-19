import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type AISettings } from '../db/schema';
import { callClaude, testConnection as testConn } from '../ai/client';
import { NARRATIVE_SYSTEM_PROMPT, BUDGET_QUERY_SYSTEM_PROMPT, AGREEMENT_QUERY_SYSTEM_PROMPT } from '../ai/prompts';
import { buildQueryContext, getDocumentContext } from '../ai/context';
import type { SafeProjectData, ClaudeMessage } from '../ai/types';
import { AIError } from '../ai/types';

const DEFAULT_SETTINGS: AISettings = {
  id: 'default',
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 1024,
  enabled: false,
};

export function useAISettings() {
  const settings = useLiveQuery(async () => {
    const s = await db.aiSettings.get('default');
    return s ?? DEFAULT_SETTINGS;
  }) ?? DEFAULT_SETTINGS;

  const saveSettings = async (updates: Partial<AISettings>) => {
    const existing = await db.aiSettings.get('default');
    if (existing) {
      await db.aiSettings.update('default', updates);
    } else {
      await db.aiSettings.put({ ...DEFAULT_SETTINGS, ...updates });
    }
  };

  return { settings, saveSettings };
}

export function useAI() {
  const { settings } = useAISettings();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEnabled = settings.enabled;
  const isConfigured = settings.enabled && !!settings.apiKey;

  const generateNarrative = useCallback(async (
    data: SafeProjectData | SafeProjectData[],
    instructions?: string
  ): Promise<{ text: string; inputTokens: number; outputTokens: number }> => {
    if (!settings.apiKey) throw new AIError('API key not configured', 'auth');

    setIsLoading(true);
    setError(null);

    try {
      const dataStr = JSON.stringify(data, null, 2);
      const userMessage = instructions
        ? `${instructions}\n\nProject data:\n${dataStr}`
        : `Generate a narrative summary for the following project data:\n\n${dataStr}`;

      const response = await callClaude(settings.apiKey, {
        model: settings.model,
        max_tokens: settings.maxTokens,
        system: NARRATIVE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      });

      return {
        text: response.content[0]?.text ?? '',
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    } catch (err) {
      const msg = err instanceof AIError ? err.message : 'An unexpected error occurred.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiKey, settings.model, settings.maxTokens]);

  const askQuestion = useCallback(async (
    question: string,
    conversationHistory: ClaudeMessage[],
    fiscalYearId: string
  ): Promise<{ answer: string; inputTokens: number; outputTokens: number }> => {
    if (!settings.apiKey) throw new AIError('API key not configured', 'auth');

    setIsLoading(true);
    setError(null);

    try {
      const { contextString } = await buildQueryContext(fiscalYearId);
      const docContext = await getDocumentContext(question, []);

      const hasDocuments = docContext.length > 0;
      const systemPrompt = hasDocuments
        ? AGREEMENT_QUERY_SYSTEM_PROMPT
        : BUDGET_QUERY_SYSTEM_PROMPT;

      // Build the context message
      let contextMessage = `Budget data:\n${contextString}`;
      if (docContext) {
        contextMessage += docContext;
      }

      // If this is the first message, prepend context
      const messages: ClaudeMessage[] = conversationHistory.length === 0
        ? [{ role: 'user', content: `${contextMessage}\n\nQuestion: ${question}` }]
        : [
            { role: 'user', content: contextMessage },
            { role: 'assistant', content: 'I have the budget data and any relevant documents. What would you like to know?' },
            ...conversationHistory,
            { role: 'user', content: question },
          ];

      const response = await callClaude(settings.apiKey, {
        model: settings.model,
        max_tokens: settings.maxTokens,
        system: systemPrompt,
        messages,
      });

      return {
        answer: response.content[0]?.text ?? '',
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    } catch (err) {
      const msg = err instanceof AIError ? err.message : 'An unexpected error occurred.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiKey, settings.model, settings.maxTokens]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!settings.apiKey) return false;
    setIsLoading(true);
    setError(null);
    try {
      const result = await testConn(settings.apiKey);
      return result;
    } catch (err) {
      const msg = err instanceof AIError ? err.message : 'Connection failed.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiKey]);

  return {
    isEnabled,
    isConfigured,
    isLoading,
    error,
    generateNarrative,
    askQuestion,
    testConnection,
    clearError: () => setError(null),
  };
}
