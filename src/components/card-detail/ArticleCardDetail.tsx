import { CardDetailCommonEditFields, CardDetailDetailsEditList } from "./CardDetailEditFields";
import { CardDetailCommonViewFields } from "./CardDetailViewFields";
import type { CardDetailEditProps, CardDetailViewProps } from "./types";

export function ArticleCardDetailEdit(props: CardDetailEditProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonEditFields {...props} />
      <CardDetailDetailsEditList {...props} />
    </div>
  );
}

export function ArticleCardDetailView(props: CardDetailViewProps) {
  return (
    <div className="space-y-4">
      <CardDetailCommonViewFields {...props} />
    </div>
  );
}
