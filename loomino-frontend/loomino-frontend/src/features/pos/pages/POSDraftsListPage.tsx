import SalesTable from "../components/SalesTable";

function POSDraftsListPage() {
  return (
    <SalesTable
      fixedStatus="draft"
      title="Drafts"
      subtitle="Sales saved as draft — nothing here has affected stock"
      addPath="/admin/pos/sell/drafts/add"
    />
  );
}

export default POSDraftsListPage;
