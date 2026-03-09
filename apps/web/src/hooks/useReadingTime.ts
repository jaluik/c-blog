"use client";

import { useMemo } from "react";

interface UseReadingTimeOptions {
  wordsPerMinute?: number;
  chineseCharsPerMinute?: number;
}

export function useReadingTime(content: string, options: UseReadingTimeOptions = {}) {
  const { wordsPerMinute = 200, chineseCharsPerMinute = 400 } = options;

  const readingTime = useMemo(() => {
    if (!content) return { minutes: 0, words: 0 };

    // Count English words
    const englishWords = content.match(/[a-zA-Z]+/g) || [];
    const englishWordCount = englishWords.length;

    // Count Chinese characters
    const chineseChars = content.match(/[\u4e00-\u9fa5]/g) || [];
    const chineseCharCount = chineseChars.length;

    // Calculate reading time
    const englishMinutes = englishWordCount / wordsPerMinute;
    const chineseMinutes = chineseCharCount / chineseCharsPerMinute;
    const totalMinutes = Math.ceil(englishMinutes + chineseMinutes);

    return {
      minutes: Math.max(totalMinutes, 1),
      words: englishWordCount + chineseCharCount,
      englishWords: englishWordCount,
      chineseChars: chineseCharCount,
    };
  }, [content, wordsPerMinute, chineseCharsPerMinute]);

  return readingTime;
}

// Hook for article progress
export function useArticleProgress() {
  return null; // Placeholder - actual implementation would track scroll position within article
}
