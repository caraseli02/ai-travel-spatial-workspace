import {
  CardDetailCommonEditFields,
  CardDetailDetailsEditList,
  CardDetailRatingEditField,
} from "./CardDetailEditFields";
import { CardDetailCommonViewFields } from "./CardDetailViewFields";
import type { CardDetailEditProps, CardDetailViewProps } from "./types";

export function PolaroidCardDetailEdit(props: CardDetailEditProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonEditFields {...props} />
      <div className="grid grid-cols-2 gap-2">
        <CardDetailRatingEditField {...props} />
      </div>
      <CardDetailDetailsEditList {...props} />
    </div>
  );
}

export function PolaroidCardDetailView(props: CardDetailViewProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonViewFields {...props} />
    </div>
  );
}
