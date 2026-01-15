const VIATOR_BASE_URL = "https://api.viator.com/partner";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

export const fetchViator = async <T>(
  apiKey: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${VIATOR_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...buildHeaders(apiKey),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Viator API error ${response.status}: ${response.statusText} - ${errorBody}`
    );
  }

  return (await response.json()) as T;
};
