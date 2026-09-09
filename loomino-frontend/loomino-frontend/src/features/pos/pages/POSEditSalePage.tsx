import { useParams } from "react-router-dom";

import SaleForm from "../components/SaleForm";

function POSEditSalePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <SaleForm
      mode="edit"
      saleId={Number(id)}
      defaultStatus="final"
      title="Edit Invoice"
      submitLabel="Save Changes"
      redirectPath={`/admin/pos/sell/${id}`}
    />
  );
}

export default POSEditSalePage;
