import React, { useCallback, useState } from "react";

type LoadingContext = {
    loading_on: () => void;
    loading_off: () => void;
    loading: boolean;
};


export const LoadingContext = React.createContext<LoadingContext>(
    {} as LoadingContext
);

export function useLoadingValue() {
    const [loading, setLoading] = useState(false)
    return {
        loading_on: useCallback(() => {
            setLoading(true)
        }, []),
        loading_off: useCallback(() => {
            setLoading(false)
        }, []),
        loading,
    } as LoadingContext
}