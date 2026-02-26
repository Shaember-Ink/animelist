export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithRetry = async (url: string, retries = 3, retryDelay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        console.warn(`Rate limit hit on Jikan API (Attempt ${i + 1}/${retries}). Waiting...`);
        await delay(retryDelay * (i + 1)); // Exponential backoff
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(retryDelay);
    }
  }
};
