import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync(loader, deps) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error, data: current.data }));
      return null;
    }
    // The caller decides when this request should run again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let active = true;
    loaderRef.current()
      .then((data) => {
        if (active) setState({ loading: false, error: null, data });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error, data: null });
      });
    return () => {
      active = false;
    };
  }, [reload]);

  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === "function" ? updater(current.data) : updater,
    }));
  }, []);

  return { ...state, reload, setData };
}
