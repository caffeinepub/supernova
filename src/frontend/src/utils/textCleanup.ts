/**
 * Utility functions for cleaning and normalizing retrieved text snippets
 */

/**
 * Remove HTML artifacts and normalize whitespace
 */
export function cleanHtmlArtifacts(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '') // Remove numeric entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Trim text to sentence boundaries to avoid mid-sentence clipping
 */
export function trimToSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Find the last sentence boundary before maxLength
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');
  
  const lastBoundary = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (lastBoundary > maxLength * 0.7) {
    // If we found a boundary in the last 30%, use it
    return text.slice(0, lastBoundary + 1).trim();
  }
  
  // Otherwise, just truncate and add ellipsis
  return truncated.trim() + '...';
}

/**
 * Remove duplicate or near-duplicate lines
 */
export function deduplicateLines(text: string): string {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const unique: string[] = [];
  
  for (const line of lines) {
    const normalized = line.trim().toLowerCase();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      unique.push(line);
    }
  }
  
  return unique.join('\n');
}

/**
 * Remove common boilerplate phrases from retrieval results
 */
export function removeBoilerplate(text: string): string {
  const boilerplatePatterns = [
    /This article needs additional citations.*/gi,
    /\[citation needed\]/gi,
    /\[edit\]/gi,
    /Jump to navigation.*/gi,
    /From Wikipedia, the free encyclopedia.*/gi,
    /This page was last edited.*/gi,
    /Retrieved from.*/gi,
    /Categories:.*/gi,
  ];
  
  let cleaned = text;
  for (const pattern of boilerplatePatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  return cleaned.trim();
}

/**
 * Clean and normalize a snippet for use in responses
 */
export function cleanSnippet(snippet: string): string {
  let cleaned = snippet;
  cleaned = cleanHtmlArtifacts(cleaned);
  cleaned = removeBoilerplate(cleaned);
  cleaned = deduplicateLines(cleaned);
  return cleaned.trim();
}
