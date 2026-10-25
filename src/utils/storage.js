// src/utils/storage.js
// localStorage utilities with error handling

import { INITIAL_SHIPMENTS, INITIAL_ACTIVITY } from '../data/shipments';

const KEYS = {
  SHIPMENTS: 'parcelpilot_shipments',
  ACTIVITY: 'parcelpilot_activity',
};

export function loadShipments() {
  try {
    const raw = localStorage.getItem(KEYS.SHIPMENTS);
    if (!raw) return INITIAL_SHIPMENTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_SHIPMENTS;
  }
}

export function saveShipments(shipments) {
  try {
    localStorage.setItem(KEYS.SHIPMENTS, JSON.stringify(shipments));
  } catch (e) {
    console.error('ParcelPilot: Could not save shipments to localStorage', e);
  }
}

export function loadActivity() {
  try {
    const raw = localStorage.getItem(KEYS.ACTIVITY);
    if (!raw) return INITIAL_ACTIVITY;
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITY;
  }
}

export function saveActivity(activity) {
  try {
    localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(activity));
  } catch (e) {
    console.error('ParcelPilot: Could not save activity to localStorage', e);
  }
}

export function resetDemoData() {
  try {
    localStorage.setItem(KEYS.SHIPMENTS, JSON.stringify(INITIAL_SHIPMENTS));
    localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY));
  } catch (e) {
    console.error('ParcelPilot: Could not reset demo data', e);
  }
}
