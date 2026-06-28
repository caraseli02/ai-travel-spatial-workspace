import {
  CardDetailCommonEditFields,
  CardDetailDetailsEditList,
  CardDetailPriceEditField,
} from "./CardDetailEditFields";
import { CardDetailCommonViewFields, CardDetailFlightRouteView } from "./CardDetailViewFields";
import type { CardDetailEditProps, CardDetailViewProps } from "./types";

export function FlightCardDetailEdit(props: CardDetailEditProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonEditFields {...props} />
      <div className="grid grid-cols-2 gap-2">
        <CardDetailPriceEditField {...props} />
      </div>
      <CardDetailDetailsEditList {...props} />
    </div>
  );
}

export function FlightCardDetailView(props: CardDetailViewProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonViewFields {...props} />
      <CardDetailFlightRouteView />
    </div>
  );
}
