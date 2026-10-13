'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CollectionItem {
  slug: string;
  title: string;
  image_bw_url: string;
  theme: string;
  age_group: string;
  [key: string]: any;
}

export const STORAGE_KEY = 'doolia_printable_collection';
export const MAX_COLLECTION_SIZE = 9;
const CUSTOM_EVENT_NAME = 'doolia_collection_updated';

const LIMIT_ALERT_MESSAGES: Record<string, string> = {
  ko: '도안은 최대 9장까지 담을 수 있습니다.',
  en: 'You can collect up to 9 coloring pages at once.',
  zh: '最多只能收藏 9 張著色圖。',
  ja: 'ぬりえは一度に最大9枚まで保存できます。',
  es: 'Puedes guardar hasta 9 dibujos a la vez.',
};

function getLimitAlertMessage(): string {
  if (typeof window === 'undefined') return LIMIT_ALERT_MESSAGES.en;
  const lang = (
    document.documentElement.lang ||
    navigator.language ||
    'en'
  ).slice(0, 2).toLowerCase();

  return LIMIT_ALERT_MESSAGES[lang] || LIMIT_ALERT_MESSAGES.en;
}

function getStoredItems(): CollectionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load printable collection from localStorage:', error);
    return [];
  }
}

function saveStoredItems(items: CollectionItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
  } catch (error) {
    console.error('Failed to save printable collection to localStorage:', error);
  }
}

export function usePrintableCollection() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(getStoredItems());
    setIsLoaded(true);

    const handleUpdate = () => {
      setItems(getStoredItems());
    };

    window.addEventListener(CUSTOM_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addToCollection = useCallback((item: CollectionItem): boolean => {
    const current = getStoredItems();
    if (current.some((i) => i.slug === item.slug)) {
      return false;
    }
    if (current.length >= MAX_COLLECTION_SIZE) {
      if (typeof window !== 'undefined') {
        alert(getLimitAlertMessage());
      }
      return false;
    }

    const next = [...current, item];
    saveStoredItems(next);
    setItems(next);
    return true;
  }, []);

  const removeFromCollection = useCallback((slug: string) => {
    const current = getStoredItems();
    const next = current.filter((i) => i.slug !== slug);
    saveStoredItems(next);
    setItems(next);
  }, []);

  const clearCollection = useCallback(() => {
    saveStoredItems([]);
    setItems([]);
  }, []);

  const isInCollection = useCallback(
    (slug: string): boolean => {
      return items.some((i) => i.slug === slug);
    },
    [items]
  );

  return {
    items,
    count: items.length,
    isLoaded,
    addToCollection,
    removeFromCollection,
    clearCollection,
    isInCollection,
  };
}

