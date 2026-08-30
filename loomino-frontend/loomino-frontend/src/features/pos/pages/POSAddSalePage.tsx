import SaleForm from "../components/SaleForm";

function POSAddSalePage() {
  return (
    <SaleForm
      defaultStatus="final"
      title="Add Sale"
      submitLabel="Save"
      redirectPath="/admin/pos/sell/list"
    />
  );
}

export default POSAddSalePage;
