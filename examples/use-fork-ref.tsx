import React, { useRef, useEffect, forwardRef } from "react";
import { useForkRef } from "@/hooks/useForkRef";

export const CustomInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, forwardedRef) => {
  const internalRef = useRef<HTMLInputElement>(null);

  // Combine the forwarded ref and our internal ref
  const handleRef = useForkRef(internalRef, forwardedRef);

  useEffect(() => {
    // We can safely use our internal ref to focus the element
    if (internalRef.current) {
      internalRef.current.focus();
    }
  }, []);

  return <input {...props} ref={handleRef} />;
});
