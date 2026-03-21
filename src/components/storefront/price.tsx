"use client";

import { useEffect, useState } from "react";
import { useGeoStore } from "@/lib/store/useGeoStore";

interface PriceProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
}

export function Price({ amount, className = "", showSymbol = true }: PriceProps) {
  const [mounted, setMounted] = useState(false);
  const { geo, getExchangeRate, initialize } = useGeoStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    initialize();
  }, [initialize]);

  // Prevent hydration styling mismatch by rendering a skeleton or placeholder
  if (!mounted) {
    return <span className={className}>£{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>;
  }

  const rate = getExchangeRate();
  const convertedAmount = amount * rate;
  const symbol = geo?.symbol || "£";

  return (
    <span className={className}>
      {showSymbol && symbol}
      {convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}
