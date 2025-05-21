import { HTMLAttributes } from 'react';

export function Article(props: HTMLAttributes<HTMLElement>) {
  return <article {...props}>{props.children}</article>;
} 