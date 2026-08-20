import React, { useEffect, useState } from "react";
import "./PharmacistActivity.css";

import {
  getPharmacistActivities,
} from "./pharmacistData";

interface PharmacistActivityData {
  id: number;
  type: string;
  message: string;
  time: string;
}

const PharmacistActivity: React.FC = () => {
  const [activities, setActivities] =
    useState<PharmacistActivityData[]>([]);

  useEffect(() => {
    const data = getPharmacistActivities();

    setActivities(data);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return "🛒";

      case "PRESCRIPTION":
        return "📄";

      case "APPROVAL":
        return "✓";

      case "DISPENSED":
        return "📦";

      default:
        return "•";
    }
  };

  return (
    <div className="pharmacist-activity-page">

      <section className="activity-section">

        <div className="activity-header">

          <div>
            <h2>
              Pharmacist Activity
            </h2>

            <p>
              Recent orders, approvals and dispensing activities
            </p>
          </div>

        </div>

        <div className="pharmacist-activity-list">

          {activities.length === 0 ? (

            <div className="empty-activity">
              <span>✓</span>

              <h3>
                No recent activity
              </h3>

              <p>
                Pharmacist activities will appear here.
              </p>
            </div>

          ) : (

            activities.map((activity) => (

              <div
                className="pharmacist-activity-item"
                key={activity.id}
              >

                <div className="activity-icon-box">
                  {getIcon(activity.type)}
                </div>

                <div className="activity-message">

                  <strong>
                    {activity.message}
                  </strong>

                  <p>
                    {activity.type}
                  </p>

                </div>

                <span className="activity-time">
                  {activity.time}
                </span>

              </div>

            ))

          )}

        </div>

      </section>

    </div>
  );
};

export default PharmacistActivity;