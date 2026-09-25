import { Button } from '../ui/Button';
import { Dialog } from '@headlessui/react';
function LocalChip({ text }: { text: string }) { return <span>{text}</span>; }
export function BadScreen() {
  return <div className="p-4"><Dialog open><LocalChip text="hi" /><Button label="Ok" /></Dialog></div>;
}
