import { Clock, ExternalLink, MapPin, Plane, Star } from "lucide-react";

export const CANVAS_CARD_TYPE_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane size={13} />,
  hotel: <Star size={13} />,
  polaroid: <MapPin size={13} />,
  sticky: <span className="text-xs">📌</span>,
  article: <ExternalLink size={13} />,
  note: <Clock size={13} />,
};
