import { useState } from 'react';
import { summarizeResults } from '../utils/summarize';
import { isCookingPrompt, formatCookingResponse } from '../utils/cooking';

type Source = {
  title: string;
  url: string;
  excerpt: string;
};

type RetrievalResult = {
  summarizedAnswer: string;
  sources: Source[];
};

export function useInformationRetrieval() {
  const [isLoading, setIsLoading] = useState(false);
  const [partialFailureWarning, setPartialFailureWarning] = useState<string | null>(null);

  const fetchInformation = async (query: string): Promise<RetrievalResult> => {
    setIsLoading(true);
    setPartialFailureWarning(null);

    try {
      const [wikipediaResults, duckDuckGoResults] = await Promise.allSettled([
        fetchWikipedia(query),
        fetchDuckDuckGo(query)
      ]);

      const sources: Source[] = [];
      const snippets: string[] = [];
      let failureCount = 0;

      // Collect Wikipedia results (can be multiple)
      if (wikipediaResults.status === 'fulfilled' && wikipediaResults.value.length > 0) {
        sources.push(...wikipediaResults.value);
        snippets.push(...wikipediaResults.value.map(s => s.excerpt));
      } else {
        failureCount++;
      }

      // Collect DuckDuckGo results (can be multiple)
      if (duckDuckGoResults.status === 'fulfilled' && duckDuckGoResults.value.length > 0) {
        sources.push(...duckDuckGoResults.value);
        snippets.push(...duckDuckGoResults.value.map(s => s.excerpt));
      } else {
        failureCount++;
      }

      // Check if this is a cooking query
      const isCooking = isCookingPrompt(query);

      // For cooking queries, even with no sources, we can provide a helpful response
      if (sources.length === 0) {
        if (isCooking) {
          // formatCookingResponse handles empty snippets with fallback
          const summarizedAnswer = formatCookingResponse(snippets, query);
          return {
            summarizedAnswer,
            sources: []
          };
        }
        throw new Error('Unable to retrieve information from any source');
      }

      if (failureCount > 0 && !isCooking) {
        setPartialFailureWarning(
          `Some information sources were unavailable. Results may be incomplete.`
        );
      }

      // Format response based on query type
      const summarizedAnswer = isCooking 
        ? formatCookingResponse(snippets, query)
        : summarizeResults(query, snippets);

      return {
        summarizedAnswer,
        sources
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchInformation,
    isLoading,
    partialFailureWarning
  };
}

async function fetchWikipedia(query: string): Promise<Source[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search || searchData.query.search.length === 0) {
      return [];
    }

    const results: Source[] = [];

    // Get up to 3 results
    for (const result of searchData.query.search.slice(0, 3)) {
      const pageTitle = result.title;
      const snippet = result.snippet.replace(/<[^>]*>/g, '');

      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
      const extractResponse = await fetch(extractUrl);
      const extractData = await extractResponse.json();

      const pages = extractData.query?.pages;
      const pageId = Object.keys(pages)[0];
      const extract = pages[pageId]?.extract || snippet;

      results.push({
        title: `Wikipedia: ${pageTitle}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`,
        excerpt: extract.slice(0, 500) + (extract.length > 500 ? '...' : '')
      });
    }

    return results;
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    return [];
  }
}

async function fetchDuckDuckGo(query: string): Promise<Source[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(url);
    const data = await response.json();

    const results: Source[] = [];

    // Add abstract if available
    if (data.AbstractText) {
      results.push({
        title: `DuckDuckGo: ${data.Heading || query}`,
        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        excerpt: data.AbstractText
      });
    }

    // Add related topics (up to 3)
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 3)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: `DuckDuckGo: ${topic.Text.split(' - ')[0]}`,
            url: topic.FirstURL,
            excerpt: topic.Text
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('DuckDuckGo fetch error:', error);
    return [];
  }
}
