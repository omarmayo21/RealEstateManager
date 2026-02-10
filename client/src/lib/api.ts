export async function apiRequest(
  method: string,
  url: string,
  body?: any
) {
  const headers: Record<string, string> = {};

  let finalBody = body;

  // لو body object → JSON
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: finalBody,
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
}
