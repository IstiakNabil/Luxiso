import SaleForm from "../components/SaleForm";

function POSAddQuotationPage() {
  return (
    <SaleForm
      defaultStatus="quotation"
      title="Add Quotation"
      submitLabel="Save Quotation"
      redirectPath="/admin/pos/sell/quotations"
    />
  );
}

export default POSAddQuotationPage;
