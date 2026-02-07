export function summarizeResults(query: string, snippets: string[]): string {
  if (snippets.length === 0) {
    return 'I was unable to find information about your query. Please try rephrasing your question.';
  }

  // Combine snippets and create a coherent summary
  const combinedText = snippets.join(' ');
  
  // Extract first few sentences for a concise summary
  const sentences = combinedText.match(/[^.!?]+[.!?]+/g) || [combinedText];
  const summary = sentences.slice(0, 4).join(' ').trim();

  if (summary.length < 50) {
    return combinedText.slice(0, 600) + (combinedText.length > 600 ? '...' : '');
  }

  return summary;
}
