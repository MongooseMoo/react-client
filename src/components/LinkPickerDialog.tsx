import { useEffect, useMemo, useRef } from "react";
import AccessibleList from "./AccessibleList";
import { type ExtractedLink, openLink } from "../messageLinks";
import "./LinkPickerDialog.css";

interface LinkPickerDialogProps {
  /** Links to choose from; null/empty keeps the dialog closed. */
  links: ExtractedLink[] | null;
  onClose: () => void;
}

interface LinkListItem extends ExtractedLink {
  id: string;
}

/**
 * Modal shown when the Alt+Arrow-reviewed message contains more than one link.
 * Uses the native <dialog> showModal() so focus trapping, the inert background,
 * Escape-to-close, and focus restoration come for free (same pattern as
 * PreferencesDialog). The choices are an APG listbox (AccessibleList): arrow
 * keys / Home / End / typeahead move the active option, Enter or click opens it.
 */
export default function LinkPickerDialog({ links, onClose }: LinkPickerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const isOpen = !!links && links.length > 0;

  // Hrefs are deduped in extractLinks, so they make stable option ids/keys.
  const items = useMemo<LinkListItem[]>(
    () => (links ?? []).map((link) => ({ ...link, id: link.href })),
    [links]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      // showModal() throws if the dialog is already open.
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Keep React state in step when the dialog closes natively (Escape / backdrop).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleActivate = (index: number) => {
    const item = items[index];
    if (!item) return;
    openLink(item);
    onClose();
  };

  return (
    <dialog
      className="link-picker-dialog"
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby="link-picker-title"
    >
      <h2 id="link-picker-title">Select a link to open</h2>
      <AccessibleList
        items={items}
        listId="link-picker-list"
        labelledBy="link-picker-title"
        className="link-picker-listbox"
        renderItem={(item) => item.label}
        getItemTextValue={(item) => item.label.toLowerCase()}
        onActivate={handleActivate}
      />
      <button type="button" className="link-picker-cancel" onClick={onClose}>
        Cancel
      </button>
    </dialog>
  );
}
