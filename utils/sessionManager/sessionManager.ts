"use client";

const SESSION_TIMEOUT = 30 * 60 * 1000;

export const resetSessionTimer = (): void => {
  const expiryTime = Date.now() + SESSION_TIMEOUT;
  localStorage.setItem("sessionExpiry", expiryTime.toString());
};

export const checkSessionTimeout = (): boolean => {
  const expiryTime = localStorage.getItem("sessionExpiry");
  if (!expiryTime) return false;
  return Date.now() < parseInt(expiryTime, 10);
};

export const clearSession = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("sessionExpiry");
};

export const getRemainingTime = (): number => {
  const expiryTime = localStorage.getItem("sessionExpiry");
  if (!expiryTime) return 0;
  const remaining = parseInt(expiryTime, 10) - Date.now();
  return remaining > 0 ? remaining : 0;
};
