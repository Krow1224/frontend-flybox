export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function traerdeAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

//permite hacer peticiones al backend fácilmente desde cualquier componente (experimental)
