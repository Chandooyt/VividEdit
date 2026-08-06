import AnalyticsSection from "./AnalyticsSection";

export default function AnalyticsPage({ feedback = [] }) {
  return (
    <div>
      <AnalyticsSection feedback={feedback} />
    </div>
  );
}