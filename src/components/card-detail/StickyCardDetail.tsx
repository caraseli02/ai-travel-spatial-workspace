import {
  CardDetailCommonEditFields,
  CardDetailDetailsEditList,
  CardDetailStickyColorField,
} from "./CardDetailEditFields";
import { CardDetailCommonViewFields } from "./CardDetailViewFields";
import type { CardDetailEditProps, CardDetailViewProps } from "./types";

export function StickyCardDetailEdit(props: CardDetailEditProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonEditFields {...props} />
      <CardDetailStickyColorField {...props} />
      <CardDetailDetailsEditList {...props} />
    </div>
  );
}

export function StickyCardDetailView(props: CardDetailViewProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonViewFields {...props} />
    </div>
  );
}
