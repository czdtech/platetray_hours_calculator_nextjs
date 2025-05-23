import { HTMLAttributes } from "react";

export function Aside(props: HTMLAttributes<HTMLElement>) {
  return <aside {...props}>{props.children}</aside>;
}
