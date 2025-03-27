import { Fragment } from 'react';
import { Transition } from '@headlessui/react';

interface AnimatedTransitionProps {
  show: boolean;
  children: React.ReactNode;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}

export function AnimatedTransition({
  show,
  children,
  enter = 'transition ease-out duration-200',
  enterFrom = 'opacity-0 translate-y-1',
  enterTo = 'opacity-100 translate-y-0',
  leave = 'transition ease-in duration-150',
  leaveFrom = 'opacity-100 translate-y-0',
  leaveTo = 'opacity-0 translate-y-1',
}: AnimatedTransitionProps) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter={enter}
      enterFrom={enterFrom}
      enterTo={enterTo}
      leave={leave}
      leaveFrom={leaveFrom}
      leaveTo={leaveTo}
    >
      {children}
    </Transition>
  );
} 