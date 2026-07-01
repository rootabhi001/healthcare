import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { clearAuth, getUser } from "../utils/auth";

function ProfileField({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">
        {value || "—"}
      </dd>
    </div>
  );
}

function MetricField({ label, value, unit }) {
  const display =
    value != null && value !== "" ? `${value}${unit ? ` ${unit}` : ""}` : "—";

  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{display}</p>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/user/dashboard");
        setDashboard(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const { client, latestReport, totalReports } = dashboard || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              My Dashboard
            </h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
            Loading dashboard...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && dashboard && (
          <>
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Profile
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProfileField label="Full Name" value={client.fullName} />
                <ProfileField label="Email" value={client.email} />
                <ProfileField label="City" value={client.city} />
                <ProfileField
                  label="Health Condition"
                  value={client.healthCondition}
                />
                <ProfileField label="Beauty Goal" value={client.beautyGoal} />
              </dl>
            </section>

            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Latest Report
                </h2>
                <p className="text-sm text-slate-500">
                  Total reports:{" "}
                  <span className="font-semibold text-slate-800">
                    {totalReports}
                  </span>
                </p>
              </div>

              {latestReport ? (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Report date:{" "}
                    <span className="font-medium text-slate-800">
                      {new Date(latestReport.reportDate).toLocaleDateString()}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <MetricField
                      label="Hemoglobin"
                      value={latestReport.hemoglobin}
                      unit="g/dL"
                    />
                    <MetricField
                      label="Vitamin D"
                      value={latestReport.vitaminD}
                      unit="ng/mL"
                    />
                    <MetricField
                      label="Cholesterol"
                      value={latestReport.cholesterol}
                      unit="mg/dL"
                    />
                    <MetricField
                      label="Blood Sugar (Fasting)"
                      value={latestReport.bloodSugarFasting}
                      unit="mg/dL"
                    />
                    <MetricField label="BMI" value={latestReport.bmi} />
                  </div>
                  {latestReport.doctorNotes && (
                    <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                      <p className="text-xs text-slate-500">Doctor Notes</p>
                      <p className="mt-1 text-sm text-slate-800">
                        {latestReport.doctorNotes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  No health reports available yet.
                </p>
              )}
            </section>

            <div className="flex justify-end">
              <Link
                to="/user/reports"
                className="inline-flex items-center rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
              >
                View Report History
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
