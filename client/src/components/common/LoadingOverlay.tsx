import { Transition } from '@headlessui/react';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingOverlay({ isOpen, message = "Loading your dashboard" }: LoadingOverlayProps) {
  return (
    <Transition
      show={isOpen}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-1">{message}</h2>
          <p className="text-neutral-600">Fetching the latest data from your connected platforms...</p>
        </div>
      </div>
    </Transition>
  );
}
