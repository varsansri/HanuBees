'use client';

import { useEffect, useRef } from 'react';

// In-memory cache: stores page data briefly so back button is instant
const pageCache = new Map<string, { data: any; timestamp: number; fetching: boolean }>();
const CACHE_TTL = 30000; // 30 seconds

export function usePageCache() {
  const cacheRef = useRef(pageCache);

  const get = (key: string) => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL) {
      cacheRef.current.delete(key);
      return null;
    }
    return entry.data;
  };

  const set = (key: string, data: any) => {
    cacheRef.current.set(key, { data, timestamp: Date.now(), fetching: false });
  };

  const prefetch = (key: string, fetcher: () => Promise<any>) => {
    const existing = cacheRef.current.get(key);
    if (existing?.fetching) return; // already fetching

    const entry = cacheRef.current.get(key) || { data: null, timestamp: 0, fetching: false };
    entry.fetching = true;
    cacheRef.current.set(key, entry);

    fetcher()
      .then((data) => {
        cacheRef.current.set(key, { data, timestamp: Date.now(), fetching: false });
      })
      .catch(() => {
        entry.fetching = false;
        cacheRef.current.set(key, entry);
      });
  };

  return { get, set, prefetch };
}

export const cache = {
  get: (key: string) => {
    const entry = pageCache.get(key);
    if (!entry) return null;
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL) {
      pageCache.delete(key);
      return null;
    }
    return entry.data;
  },
  set: (key: string, data: any) => {
    pageCache.set(key, { data, timestamp: Date.now(), fetching: false });
  },
  prefetch: (key: string, fetcher: () => Promise<any>) => {
    const existing = pageCache.get(key);
    if (existing?.fetching) return;

    const entry = pageCache.get(key) || { data: null, timestamp: 0, fetching: false };
    entry.fetching = true;
    pageCache.set(key, entry);

    fetcher()
      .then((data) => {
        pageCache.set(key, { data, timestamp: Date.now(), fetching: false });
      })
      .catch(() => {
        entry.fetching = false;
        pageCache.set(key, entry);
      });
  },
};
