import { useState, useEffect } from "react";
import { isAmountMasked } from "@/lib/storage";

export function useAmountMask() {
  const [masked, setMasked] = useState(isAmountMasked());

  useEffect(() => {
    const handleChange = () => setMasked(isAmountMasked());
    window.addEventListener("ankiba-mask-change", handleChange);
    return () => window.removeEventListener("ankiba-mask-change", handleChange);
  }, []);

  return masked;
}
