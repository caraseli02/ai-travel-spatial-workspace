import { useEffect, useState } from "react";
import type { CanvasCard } from "../../models/trip";
import type { CardDetailEditHandlers, CardDetailEditState } from "./types";

export function useCardDetailEditState(
  card: CanvasCard | null,
  onUpdateCard?: (updated: CanvasCard) => void,
) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editTagColor, setEditTagColor] = useState("slate");
  const [editDetails, setEditDetails] = useState<string[]>([]);
  const [editPrice, setEditPrice] = useState("");
  const [editRating, setEditRating] = useState(4.5);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!card) return;
    setEditTitle(card.title);
    setEditSubtitle(card.subtitle || "");
    setEditTag(card.tag || "");
    setEditTagColor(card.tagColor || "slate");
    setEditDetails(card.details || []);
    setEditPrice(card.price || "");
    setEditRating(card.rating || 4.5);
    setIsEditing(false);
    setConfirmDelete(false);
  }, [card?.id]);

  const handleFieldChange = (updates: Partial<CanvasCard>) => {
    if (!card) return;
    onUpdateCard?.({ ...card, ...updates });
  };

  const editState: CardDetailEditState = {
    title: editTitle,
    subtitle: editSubtitle,
    tag: editTag,
    tagColor: editTagColor,
    details: editDetails,
    price: editPrice,
    rating: editRating,
  };

  const handlers: CardDetailEditHandlers = {
    onTitleChange: (val) => {
      setEditTitle(val);
      handleFieldChange({ title: val });
    },
    onSubtitleChange: (val) => {
      setEditSubtitle(val);
      handleFieldChange({ subtitle: val });
    },
    onTagChange: (val) => {
      setEditTag(val);
      handleFieldChange({ tag: val });
    },
    onTagColorChange: (val) => {
      setEditTagColor(val);
      handleFieldChange({ tagColor: val });
    },
    onPriceChange: (val) => {
      setEditPrice(val);
      handleFieldChange({ price: val });
    },
    onRatingChange: (val) => {
      setEditRating(val);
      handleFieldChange({ rating: val });
    },
    onDetailItemChange: (index, val) => {
      const updated = [...editDetails];
      updated[index] = val;
      setEditDetails(updated);
      handleFieldChange({ details: updated });
    },
    onAddDetail: () => {
      const updated = [...editDetails, "New detail point"];
      setEditDetails(updated);
      handleFieldChange({ details: updated });
    },
    onRemoveDetail: (index) => {
      const updated = editDetails.filter((_, i) => i !== index);
      setEditDetails(updated);
      handleFieldChange({ details: updated });
    },
    onFieldChange: handleFieldChange,
  };

  return {
    isEditing,
    setIsEditing,
    confirmDelete,
    setConfirmDelete,
    editState,
    handlers,
  };
}
