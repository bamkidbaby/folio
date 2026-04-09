import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
const API = import.meta.env.VITE_API_URL || "";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [shelf, setShelf] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Load shelf when user logs in
  useEffect(() => {
    if (!user) {
      setShelf([]);
      return;
    }
    setLoading(true);
    fetch("/api/shelf", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setShelf(Array.isArray(data) ? data : []))
      .catch(() => setShelf([]))
      .finally(() => setLoading(false));
  }, [user]);

  const addToShelf = useCallback(async (book, status = "wishlist") => {
    const res = await fetch(`${API}/api/shelf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...book, status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setShelf((prev) => {
      const exists = prev.find((b) => b.book_id === data.book_id);
      return exists
        ? prev.map((b) => (b.book_id === data.book_id ? data : b))
        : [data, ...prev];
    });
    return data;
  }, []);

  const updateShelf = useCallback(async (bookId, updates) => {
    const res = await fetch(`${API}/api/shelf/${bookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setShelf((prev) => prev.map((b) => (b.book_id === bookId ? data : b)));
    return data;
  }, []);

  const removeFromShelf = useCallback(async (bookId) => {
    await fetch(`/api/shelf/${bookId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setShelf((prev) => prev.filter((b) => b.book_id !== bookId));
  }, []);

  const toggleFavorite = useCallback(
    async (bookId) => {
      const book = shelf.find((b) => b.book_id === bookId);
      if (!book) return;
      return updateShelf(bookId, { favorited: !book.favorited });
    },
    [shelf, updateShelf],
  );

  const searchBooks = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `${API}/api/books/search?q=${encodeURIComponent(query)}`,
        { credentials: "include" },
      );
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Derived state
  const favorites = shelf.filter((b) => b.favorited);
  const reading = shelf.filter((b) => b.status === "reading");
  const read = shelf.filter((b) => b.status === "read");
  const wishlist = shelf.filter((b) => b.status === "wishlist");
  const currentlyReading = reading[0] || null;

  const isOnShelf = (bookId) => shelf.some((b) => b.book_id === bookId);
  const isFavorite = (bookId) =>
    shelf.some((b) => b.book_id === bookId && b.favorited);
  const getStatus = (bookId) =>
    shelf.find((b) => b.book_id === bookId)?.status || null;

  return (
    <LibraryContext.Provider
      value={{
        shelf,
        loading,
        favorites,
        reading,
        read,
        wishlist,
        currentlyReading,
        searchResults,
        searching,
        addToShelf,
        updateShelf,
        removeFromShelf,
        toggleFavorite,
        searchBooks,
        setSearchResults,
        isOnShelf,
        isFavorite,
        getStatus,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be inside LibraryProvider");
  return ctx;
};
