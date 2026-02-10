export async function apiRequest<T = any>(
  method: string,
  url: string,
  body?: any
): Promise<T> {
  const headers: Record<string, string> = {};

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let finalBody = body;

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: finalBody,
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
}
