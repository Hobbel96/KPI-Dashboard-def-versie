"use client";

import { ReactNode } from "react";

interface DeleteButtonProps {
  onDelete: () => void;
  confirmMessage: string;
  children: ReactNode;
  className?: string;
}

export function DeleteButton({
  onDelete,
  confirmMessage,
  children,
  className = "text-status-red text-sm hover:underline",
}: DeleteButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(confirmMessage)) {
      onDelete();
    }
  };

  return (
    <button onClick={handleClick} className={className} type="button">
      {children}
    </button>
  );
}
