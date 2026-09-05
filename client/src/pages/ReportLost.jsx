import ReportForm from "./_ReportFormShared.jsx";

function ReportLost() {
  return (
    <ReportForm
      type="lost"
      title="Report a lost item"
      subtitle="The more detail you include, the faster Perdita can find a match."
      dateLabel="Date lost"
      locationLabel="Location lost"
    />
  );
}

export default ReportLost;