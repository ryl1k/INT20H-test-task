import { useCallback, useEffect } from "react";
import { getOrders, getAllOrders } from "@/api/ordersApi";
import { useOrderStore } from "@/store/useOrderStore";

export function useOrders() {
  const { orders, meta, filters, loading, error, setOrders, setLoading, setError, setAllOrders, allOrders } =
    useOrderStore();

  const fetchOrders = useCallback(
    async (page?: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getOrders(page ?? meta.page, meta.perPage, filters);
        setOrders(res.data, res.meta);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    },
    [meta.page, meta.perPage, filters, setOrders, setLoading, setError]
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

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return { orders, allOrders, meta, filters, loading, error, fetchOrders, fetchAllOrders };
}
