"use client";

import { ROSA_BASE_API_PATH } from "@/context/constants";
import { Site, Event, Patient, Hp, Calendar } from "./dashboard.types";

const API_BASE = ROSA_BASE_API_PATH
const TOKEN_KEY = "rosa_token";

// =========================
// GET BEARER TOKEN
// =========================
const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("No Rosa token found");
  return token;
};

// =========================
// GENERIC FETCH WRAPPER
// =========================
async function apiGet<T>(endpoint: string): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    console.error("API Error:", res.status, await res.text());
    throw new Error("API Request Failed");
  }

  return res.json();
}

// =========================================================
// 1️⃣ FETCH ALL BRANCHES (SITES)
// =========================================================
export async function getAllSites(): Promise<Site[]> {
  const params = "?limit=2000&sortField=name&sortDirection=1";

  const json = await apiGet<{
    elements: Site[];
  }>(`/sites${params}`);

  return json.elements || [];
}

// =========================================================
// 2️⃣ FETCH ALL CALENDARS (USED FOR BRANCH + THERAPIST MAPPING)
// =========================================================
export async function getAllCalendars(): Promise<Calendar[]> {
  const params = "?limit=2000&sortField=label&sortDirection=1";

  const json = await apiGet<{
    elements: Calendar[];
  }>(`/calendars${params}`);

  return json.elements || [];
}

// =========================================================
// 3️⃣ FETCH ALL THERAPISTS (HPS)
// =========================================================
export async function getAllHps(): Promise<Hp[]> {
  const params = "?limit=2000&sortField=startAt&sortDirection=1";

  const json = await apiGet<{
    elements: Hp[];
  }>(`/hps${params}`);

  return json.elements || [];
}

// =========================================================
// 4️⃣ FETCH ALL PATIENTS — WITH AUTO-PAGINATION
// =========================================================
export async function getAllPatients(): Promise<Patient[]> {
  let page = 1;
  const limit = 2000;

  let all: Patient[] = [];
  let hasNext = true;

  while (hasNext) {
    const json = await apiGet<{
      elements: Patient[];
      hasNextPage: boolean;
      page: number;
      totalPages: number;
    }>(`/patients?limit=${limit}&page=${page}`);

    all.push(...(json.elements || []));
    hasNext = json.hasNextPage;
    page++;
  }

  return all;
}

// =========================================================
// 5️⃣ FETCH ALL EVENTS (APPOINTMENTS) — AUTO-PAGINATED
// =========================================================
export async function getAllEvents(
  from?: string,
  to?: string
): Promise<Event[]> {
  let page = 1;
  const limit = 2000;

  let all: Event[] = [];
  let hasNext = true;

  let dateFilter = "";
  if (from && to) {
    dateFilter = `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  }

  while (hasNext) {
    const json = await apiGet<{
      elements: Event[];
      hasNextPage: boolean;
      page: number;
    }>(
      `/events?limit=${limit}&sortField=startAt&sortDirection=1&page=${page}${dateFilter}`
    );

    all.push(...(json.elements || []));
    hasNext = json.hasNextPage;
    page++;
  }

  return all;
}
