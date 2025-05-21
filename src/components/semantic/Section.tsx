import { HTMLAttributes } from 'react';

export function Section(props: HTMLAttributes<HTMLElement>) {
  return <section {...props}>{props.children}</section>;
} 