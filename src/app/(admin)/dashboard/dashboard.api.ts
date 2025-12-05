'use client';

import { ROSA_BASE_API_PATH } from '@/context/constants';
import { Site, Event, Patient, Hp, Calendar } from './dashboard.types';

const API_BASE = ROSA_BASE_API_PATH;
const TOKEN_KEY = 'rosa_token';

// =========================
// GET BEARER TOKEN
// =========================
const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('No Rosa token found');
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
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    console.error('API Error:', res.status, await res.text());
    throw new Error('API Request Failed');
  }

  return res.json();
}

// =========================================================
// 1️⃣ FETCH ALL BRANCHES (SITES) - REMAINS SINGLE REQUEST
// =========================================================
export async function getAllSites(): Promise<Site[]> {
  const params = '?limit=2000&sortField=name&sortDirection=1';

  const json = await apiGet<{
    elements: Site[];
  }>(`/sites${params}`);

  return json.elements || [];
}

// =========================================================
// 2️⃣ FETCH ALL CALENDARS (USED FOR BRANCH + THERAPIST MAPPING) - REMAINS SINGLE REQUEST
// =========================================================
export async function getAllCalendars(): Promise<Calendar[]> {
  const params = '?limit=2000&sortField=label&sortDirection=1';

  const json = await apiGet<{
    elements: Calendar[];
  }>(`/calendars${params}`);

  return json.elements || [];
}

// =========================================================
// 3️⃣ FETCH ALL THERAPISTS (HPS) - REMAINS SINGLE REQUEST
// =========================================================
export async function getAllHps(): Promise<Hp[]> {
  const params = '?limit=2000&sortField=startAt&sortDirection=1';

  const json = await apiGet<{
    elements: Hp[];
  }>(`/hps${params}`);

  return json.elements || [];
}

// =========================================================
// 4️⃣ FETCH ALL PATIENTS — WITH CONCURRENT PAGINATION
// ⭐ OPTIMIZED for speed using Promise.all() for subsequent pages
// =========================================================
export async function getAllPatients(): Promise<Patient[]> {
  const limit = 2000;
  const initialPage = 1;

  // 1. Fetch the first page to get totalPages
  const firstPageJson = await apiGet<{
    elements: Patient[];
    totalPages: number;
  }>(`/patients?limit=${limit}&page=${initialPage}`);

  const totalPages = firstPageJson.totalPages || 1;
  let allPatients = firstPageJson.elements || [];

  // 2. If there's only one page, return immediately
  if (totalPages <= 1) {
    return allPatients;
  }

  // 3. Create promises for all subsequent pages (page 2 to totalPages)
  const pagePromises: Promise<any>[] = [];
  for (let page = 2; page <= totalPages; page++) {
    // All these requests run concurrently
    pagePromises.push(apiGet<{ elements: Patient[] }>(`/patients?limit=${limit}&page=${page}`));
  }

  // 4. Wait for all concurrent fetches to complete
  const results = await Promise.all(pagePromises);

  // 5. Aggregate all elements
  for (const json of results) {
    allPatients.push(...(json.elements || []));
  }

  return allPatients;
}

// =========================================================
// 5️⃣ FETCH ALL EVENTS (APPOINTMENTS) — WITH CONCURRENT PAGINATION
// ⭐ OPTIMIZED for speed using Promise.all() for subsequent pages
// =========================================================
export async function getAllEvents(from?: string, to?: string): Promise<Event[]> {
  const limit = 2000;
  const initialPage = 1;

  let dateFilter = '';
  if (from && to) {
    // API-side date filtering is critical for performance
    dateFilter = `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  }

  // 1. Fetch the first page to get totalPages (with date filter applied)
  const firstPageJson = await apiGet<{
    elements: Event[];
    totalPages: number;
  }>(`/events?limit=${limit}&sortField=startAt&sortDirection=1&page=${initialPage}${dateFilter}`);

  const totalPages = firstPageJson.totalPages || 1;
  let allEvents = firstPageJson.elements || [];

  // 2. If there's only one page, return immediately
  if (totalPages <= 1) {
    return allEvents;
  }

  // 3. Create promises for all subsequent pages (page 2 to totalPages)
  const pagePromises: Promise<any>[] = [];
  for (let page = 2; page <= totalPages; page++) {
    // All these requests run concurrently, including the date filter
    pagePromises.push(
      apiGet<{ elements: Event[] }>(
        `/events?limit=${limit}&sortField=startAt&sortDirection=1&page=${page}${dateFilter}`,
      ),
    );
  }

  // 4. Wait for all concurrent fetches to complete
  const results = await Promise.all(pagePromises);

  // 5. Aggregate all elements
  for (const json of results) {
    allEvents.push(...(json.elements || []));
  }

  return allEvents;
}
