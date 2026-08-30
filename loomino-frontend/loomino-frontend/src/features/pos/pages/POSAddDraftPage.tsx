import SaleForm from "../components/SaleForm";

function POSAddDraftPage() {
  return (
    <SaleForm
      defaultStatus="draft"
      title="Add Draft"
      submitLabel="Save Draft"
      redirectPath="/admin/pos/sell/drafts"
    />
  );
}

export default POSAddDraftPage;
