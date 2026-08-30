import SalesTable from "../components/SalesTable";

function POSQuotationsListPage() {
  return (
    <SalesTable
      fixedStatus="quotation"
      title="Quotations"
      subtitle="Quotes sent to customers — nothing here has affected stock"
      addPath="/admin/pos/sell/quotations/add"
    />
  );
}

export default POSQuotationsListPage;
