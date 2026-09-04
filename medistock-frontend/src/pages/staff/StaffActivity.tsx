import React from "react";
import "./StaffActivity.css";

interface Activity {
  id: number;
  type: string;
  icon: string;
  title: string;
  description: string;
  time: string;
}

const StaffActivity: React.FC = () => {

  const activities: Activity[] = [
    {
      id: 1,
      type: "view",
      icon: "👁️",
      title: "Viewed Paracetamol 500mg",
      description: "Medicine details were viewed",
      time: "Today, 10:15 AM",
    },
    {
      id: 2,
      type: "search",
      icon: "🔎",
      title: "Searched Amoxicillin",
      description: "Medicine search performed",
      time: "Today, 09:42 AM",
    },
    {
      id: 3,
      type: "stock",
      icon: "📦",
      title: "Checked stock availability",
      description: "Stock information was viewed",
      time: "Today, 09:25 AM",
    },
    {
      id: 4,
      type: "view",
      icon: "👁️",
      title: "Viewed Cough Syrup",
      description: "Medicine details were viewed",
      time: "Yesterday, 04:30 PM",
    },
    {
      id: 5,
      type: "search",
      icon: "🔎",
      title: "Searched Azithromycin",
      description: "Medicine search performed",
      time: "Yesterday, 02:18 PM",
    },
  ];

  return (
    <div className="staff-activity-page">

      {/* Activity summary */}
      <section className="activity-summary">

        <div className="activity-summary-card">
          <span>Total Activities</span>
          <strong>{activities.length}</strong>
        </div>

        <div className="activity-summary-card">
          <span>Searches</span>
          <strong>
            {
              activities.filter(
                (activity) => activity.type === "search"
              ).length
            }
          </strong>
        </div>

        <div className="activity-summary-card">
          <span>Medicine Views</span>
          <strong>
            {
              activities.filter(
                (activity) => activity.type === "view"
              ).length
            }
          </strong>
        </div>

      </section>

      {/* Activity list */}
      <section className="activity-card">

        <div className="activity-heading">
          <h2>Recent Activity</h2>
          <p>
            Your recent permitted inventory activities
          </p>
        </div>

        <div className="staff-activity-list">

          {activities.map((activity) => (
            <div
              className="staff-activity-item"
              key={activity.id}
            >

              <div
                className={`staff-activity-icon ${activity.type}`}
              >
                {activity.icon}
              </div>

              <div className="staff-activity-content">

                <strong>
                  {activity.title}
                </strong>

                <p>
                  {activity.description}
                </p>

              </div>

              <div className="staff-activity-time">
                {activity.time}
              </div>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
};

export default StaffActivity;