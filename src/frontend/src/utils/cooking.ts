type CookingPromptPattern = {
  keywords: string[];
  type: 'recipe' | 'cooking';
};

const COOKING_PATTERNS: CookingPromptPattern[] = [
  { keywords: ['recipe', 'cook', 'bake', 'make', 'prepare'], type: 'recipe' },
  { keywords: ['cookies', 'cake', 'bread', 'pasta', 'pizza', 'soup'], type: 'recipe' },
  { keywords: ['ingredients', 'steps', 'instructions', 'how to cook'], type: 'cooking' },
];

export function isCookingPrompt(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  return COOKING_PATTERNS.some(pattern =>
    pattern.keywords.some(keyword => lowerPrompt.includes(keyword))
  );
}

export function formatCookingResponse(snippets: string[], query: string): string {
  if (snippets.length === 0) {
    return 'I was unable to find cooking information for your query. Please try being more specific about the recipe or dish you\'re interested in.';
  }

  const combinedText = snippets.join(' ');
  
  // Try to extract structured information
  const ingredients = extractSection(combinedText, ['ingredient', 'you will need', 'you need']);
  const steps = extractSection(combinedText, ['step', 'instruction', 'method', 'direction', 'procedure']);
  const tips = extractSection(combinedText, ['tip', 'note', 'hint', 'suggestion']);

  let response = '';

  // Build structured response
  if (ingredients) {
    response += '**Ingredients:**\n' + ingredients + '\n\n';
  }

  if (steps) {
    response += '**Steps:**\n' + formatSteps(steps) + '\n\n';
  } else {
    // If no clear steps, provide general information
    const sentences = combinedText.match(/[^.!?]+[.!?]+/g) || [combinedText];
    response += sentences.slice(0, 5).join(' ').trim() + '\n\n';
  }

  if (tips) {
    response += '**Tips:**\n' + tips;
  }

  // If response is too short, add more context
  if (response.length < 100) {
    return combinedText.slice(0, 800) + (combinedText.length > 800 ? '...' : '');
  }

  return response.trim();
}

function extractSection(text: string, keywords: string[]): string | null {
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword);
    if (index !== -1) {
      // Extract text around the keyword
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + 300);
      return text.slice(start, end).trim();
    }
  }
  
  return null;
}

function formatSteps(stepsText: string): string {
  // Try to identify numbered or bulleted steps
  const lines = stepsText.split(/[.\n]/).filter(line => line.trim().length > 10);
  
  if (lines.length > 1) {
    return lines.map((line, idx) => `${idx + 1}. ${line.trim()}`).join('\n');
  }
  
  return stepsText;
}
