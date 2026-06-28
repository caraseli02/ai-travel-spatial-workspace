import {
  CardDetailCommonEditFields,
  CardDetailDetailsEditList,
  CardDetailPriceEditField,
  CardDetailRatingEditField,
} from "./CardDetailEditFields";
import { CardDetailCommonViewFields } from "./CardDetailViewFields";
import type { CardDetailEditProps, CardDetailViewProps } from "./types";

export function HotelCardDetailEdit(props: CardDetailEditProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonEditFields {...props} />
      <div className="grid grid-cols-2 gap-2">
        <CardDetailRatingEditField {...props} />
        <CardDetailPriceEditField {...props} />
      </div>
      <CardDetailDetailsEditList {...props} />
    </div>
  );
}

export function HotelCardDetailView(props: CardDetailViewProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonViewFields {...props} />
    </div>
  );
}
