import { ComponentProps, ComponentType, useEffect, useState } from "react";

type Loader<T> = () => Promise<{ default: T }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dynamic<T extends ComponentType<any>>(loader: Loader<T>) {
  return function DynamicComponent(properties: ComponentProps<T>) {
    const [Comp, setComp] = useState<null | T>(null);

    useEffect(() => {
      loader().then(module_ => setComp(() => module_.default));
    }, []);

    if (!Comp) {
      return null;
    }
    return <Comp {...properties} />;
  };
}
