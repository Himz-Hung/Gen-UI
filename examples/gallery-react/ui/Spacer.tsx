import { sp } from './tokens';
export interface SpacerProps { size?: '1' | '2' | '3' | '4' | '5' | '6' | '7'; grow?: boolean }
export function Spacer({ size = '3', grow = false }: SpacerProps) {
  return <div aria-hidden style={{ flex: grow ? 1 : undefined, width: grow ? undefined : sp(size), height: grow ? undefined : sp(size) }} />;
}
