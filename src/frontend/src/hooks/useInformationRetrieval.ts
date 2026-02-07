import { useState } from 'react';
import { summarizeResults } from '../utils/summarize';

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
      const [wikipediaResult, duckDuckGoResult] = await Promise.allSettled([
        fetchWikipedia(query),
        fetchDuckDuckGo(query)
      ]);

      const sources: Source[] = [];
      const snippets: string[] = [];
      let failureCount = 0;

      if (wikipediaResult.status === 'fulfilled' && wikipediaResult.value) {
        sources.push(wikipediaResult.value);
        snippets.push(wikipediaResult.value.excerpt);
      } else {
        failureCount++;
      }

      if (duckDuckGoResult.status === 'fulfilled' && duckDuckGoResult.value) {
        sources.push(duckDuckGoResult.value);
        snippets.push(duckDuckGoResult.value.excerpt);
      } else {
        failureCount++;
      }

      if (sources.length === 0) {
        throw new Error('Unable to retrieve information from any source');
      }

      if (failureCount > 0) {
        setPartialFailureWarning(
          `Some information sources were unavailable. Results may be incomplete.`
        );
      }

      const summarizedAnswer = summarizeResults(query, snippets);

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

async function fetchWikipedia(query: string): Promise<Source | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.[0]) {
      return null;
    }

    const pageTitle = searchData.query.search[0].title;
    const snippet = searchData.query.search[0].snippet.replace(/<[^>]*>/g, '');

    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const extractResponse = await fetch(extractUrl);
    const extractData = await extractResponse.json();

    const pages = extractData.query?.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId]?.extract || snippet;

    return {
      title: `Wikipedia: ${pageTitle}`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`,
      excerpt: extract.slice(0, 500) + (extract.length > 500 ? '...' : '')
    };
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    return null;
  }
}

async function fetchDuckDuckGo(query: string): Promise<Source | null> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.AbstractText) {
      return {
        title: `DuckDuckGo: ${data.Heading || query}`,
        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        excerpt: data.AbstractText
      };
    }

    if (data.RelatedTopics?.[0]?.Text) {
      return {
        title: `DuckDuckGo: ${data.RelatedTopics[0].Text.split(' - ')[0]}`,
        url: data.RelatedTopics[0].FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        excerpt: data.RelatedTopics[0].Text
      };
    }

    return null;
  } catch (error) {
    console.error('DuckDuckGo fetch error:', error);
    return null;
  }
}
