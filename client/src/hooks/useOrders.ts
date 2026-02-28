import { useCallback, useEffect, useRef } from "react";
import { getOrders, getAllOrders } from "@/api/ordersApi";
import { useOrderStore } from "@/store/useOrderStore";

export function useOrders() {
  const { orders, meta, filters, loading, error, setOrders, setLoading, setError, setAllOrders, allOrders } =
    useOrderStore();

  const fetchOrders = useCallback(
    async (page?: number, perPage?: number) => {
      setLoading(true);
      setError(null);
      try {
        const { meta: currentMeta } = useOrderStore.getState();
        const p = page ?? currentMeta.page;
        const pp = perPage ?? currentMeta.perPage;
        const res = await getOrders(p, pp, filters);
        setOrders(res.data, res.meta);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    },
    [filters, setOrders, setLoading, setError]
  );

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllOrders();
      setAllOrders(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [setAllOrders, setLoading, setError]);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) {
      // Re-fetch on filter changes (fetchOrders identity changes when filters change)
      void fetchOrders();
      return;
    }

    // Initial mount: use ignore flag to prevent StrictMode double-fetch
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { meta: currentMeta } = useOrderStore.getState();
        const res = await getOrders(currentMeta.page, currentMeta.perPage, filters);
        if (!ignore) setOrders(res.data, res.meta);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Failed to fetch orders");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    mountedRef.current = true;
    return () => { ignore = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOrders]);

  return { orders, allOrders, meta, filters, loading, error, fetchOrders, fetchAllOrders };
}
