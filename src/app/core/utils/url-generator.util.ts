export function generateFullUrl(url: string, params?: Record<string, string | null>): string {
    if (!params) {
        return url;
    }

    // Helper function to serialize a key-value pair into a query string component
    function serializeParam(key: string, value: string | null): string {
        if (value === null) {
            return ''; // Return an empty string for null values
        }
        return `${key}=${encodeURIComponent(value)}`;
    }

    // Serialize the params object into a query string
    const queryString = Object.entries(params)
        .map(([key, value]) => serializeParam(key, value))
        .filter(param => param !== '') // Filter out empty parameters
        .join('&');

    // Combine the URL and query string to create the full URL
    return `${url}${queryString ? `?${queryString}` : ''}`;
}