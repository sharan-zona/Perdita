import ReportForm from "./_ReportFormShared.jsx";

function ReportFound() {
  return (
    <ReportForm
      type="found"
      title="Report a found item"
      subtitle="Thank you for looking out for someone else's things."
      dateLabel="Date found"
      locationLabel="Location found"
    />
  );
}

export default ReportFound;