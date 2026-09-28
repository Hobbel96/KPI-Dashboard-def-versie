"use client";

interface DeleteFormProps {
  action: (formData: FormData) => void | Promise<void>;
  itemId: string;
  itemName: string;
  itemLabel?: string;
  className?: string;
  buttonText?: string;
}

export function DeleteForm({
  action,
  itemId,
  itemName,
  itemLabel = "item",
  className = "text-status-red text-sm hover:underline",
  buttonText = "Verwijderen",
}: DeleteFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`${itemLabel} '${itemName}' verwijderen?`)) {
      e.preventDefault();
      return;
    }
  };

  return (
    <form action={action} style={{ display: "inline" }} onSubmit={handleSubmit}>
      <input type="hidden" name="itemId" value={itemId} />
      <button
        type="submit"
        className={className}
      >
        {buttonText}
      </button>
    </form>
  );
}
