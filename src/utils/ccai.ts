export const getTokensData = async () => {
  const getDexTokensPrices = `
  query getDexTokensPrices {
      getDexTokensPrices {
        symbol
        price
      }
    }
  `;

  try {
    const response = await fetch('https://api.cryptocurrencies.ai/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'getDexTokensPrices',
        query: getDexTokensPrices,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const map = new Map();

    if (data && data.data && data.data.getDexTokensPrices) {
      data.data.getDexTokensPrices.forEach((tokenData) => {
        map.set(tokenData.symbol, tokenData.price);
      });
    }

    return map;
  } catch (error) {
    // Return empty map on error to prevent app crashes
    console.warn('Failed to fetch token prices:', error);
    return new Map();
  }
};
