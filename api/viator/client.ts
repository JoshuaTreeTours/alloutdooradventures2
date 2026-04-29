import { fetchViatorWithCurl } from "../../lib/viator";

const VIATOR_BASE_URL = "https://api.viator.com/partner";

export const fetchViator = async <T>(
  apiKey: string,
  endpoint: string,
  options: { method?: "GET" | "POST"; body?: string } = {}
): Promise<T> => {
  const { status, body } = await fetchViatorWithCurl(
    `${VIATOR_BASE_URL}${endpoint}`,
    apiKey,
    {
      method: options.method,
      body: options.body,
    }
  );

  if (status < 200 || status >= 300) {
    throw new Error(
      `Viator API error ${status} - ${body}`
    );
  }

  return JSON.parse(body) as T;
};
