import React, { useCallback, useState } from "react";

export function useToggle(
  defaultValue?: boolean,
): [boolean, () => void, React.Dispatch<React.SetStateAction<boolean>>] {
  const [value, setValue] = useState(!!defaultValue);

  const toggle = useCallback(() => {
    setValue((x) => !x);
  }, []);

  return [value, toggle, setValue];
}
