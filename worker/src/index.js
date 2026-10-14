export default {
  async fetch(request, env) {
    const allowedOrigin = "https://christianloydcesista.github.io";
    const origin = request.headers.get("Origin") || "";
    const headers = {
      "Access-Control-Allow-Origin": origin === allowedOrigin ? allowedOrigin : "null",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (origin && origin !== allowedOrigin) return json({ error: "Origin not allowed" }, 403, headers);
    if (!env.GITHUB_TOKEN) return json({ error: "Backend is not configured" }, 500, headers);

    const apiUrl = "https://api.github.com/repos/ChristianLoydCesista/e-routing_app/contents/dates.json";
    const apiHeaders = {
      "Authorization": "Bearer " + env.GITHUB_TOKEN,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "date-invitation-storage"
    };
    try {
      if (request.method === "GET") {
        const response = await fetch(apiUrl, { headers: apiHeaders });
        if (!response.ok) return json({ error: "Could not read dates file" }, 502, headers);
        const file = await response.json();
        return json(decodeJsonFile(file.content), 200, headers);
      }
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);
      const body = await request.json();
      const date = typeof body.selected_date === "string" ? body.selected_date : "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "Invalid date" }, 400, headers);
      const parsed = new Date(date + "T00:00:00Z");
      if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
        return json({ error: "Invalid date" }, 400, headers);
      }

      // Retry once if two visitors submit close together.
      for (let attempt = 0; attempt < 2; attempt++) {
        const currentResponse = await fetch(apiUrl, { headers: apiHeaders });
        if (!currentResponse.ok) return json({ error: "Could not read dates file" }, 502, headers);
        const file = await currentResponse.json();
        const store = decodeJsonFile(file.content);
        if (!store || !Array.isArray(store.dates)) return json({ error: "dates.json has an unexpected format" }, 500, headers);
        store.dates.push({ selected_date: date, created_at: new Date().toISOString() });
        const content = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(store, null, 2) + "\n")));
        const update = await fetch(apiUrl, {
          method: "PUT",
          headers: { ...apiHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Record a date invitation selection", content, sha: file.sha, branch: "main" })
        });
        if (update.ok) return json({ saved: true, selected_date: date }, 201, headers);
        if (update.status !== 409 && update.status !== 422) return json({ error: "Could not save date" }, 502, headers);
      }
      return json({ error: "A simultaneous update occurred. Please try again." }, 409, headers);
    } catch (error) {
      return json({ error: "Unexpected storage error" }, 500, headers);
    }
  }
};

function decodeJsonFile(base64) {
  const binary = atob(base64.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers });
}
