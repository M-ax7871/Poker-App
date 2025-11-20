import type { HandPayload, HandRecord } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHands(): Promise<HandRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/hands`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return [];
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch hands:", error);
    return [];
  }
}

export async function saveHand(payload: HandPayload): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/hands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to save hand: ${res.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("Failed to save hand:", error);
    throw error;
  }
}