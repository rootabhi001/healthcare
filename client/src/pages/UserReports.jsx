import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function formatValue(value) {
  return value != null && value !== "" ? value : "—";
}

function ReportCard({ report }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-3 md:hidden">
      <p className="text-sm font-semibold text-slate-800">
        {formatDate(report.reportDate)}
      </p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-slate-500">Hemoglobin</dt>
          <dd className="font-medium text-slate-800">
            {formatValue(report.hemoglobin)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Vitamin D</dt>
          <dd className="font-medium text-slate-800">
            {formatValue(report.vitaminD)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Cholesterol</dt>
          <dd className="font-medium text-slate-800">
            {formatValue(report.cholesterol)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Blood Sugar</dt>
          <dd className="font-medium text-slate-800">
            {formatValue(report.bloodSugarFasting)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">BMI</dt>
          <dd className="font-medium text-slate-800">
            {formatValue(report.bmi)}
          </dd>
        </div>
      </dl>
      {report.doctorNotes && (
        <div className="text-sm">
          <p className="text-slate-500">Doctor Notes</p>
          <p className="text-slate-800">{report.doctorNotes}</p>
        </div>
      )}
    </div>
  );
}

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/user/reports", {
        params: { page, limit: 10 },
      });
      setReports(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/user/dashboard"
            className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800 mb-2"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">
            Report History
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-slate-500">No reports found.</p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {reports.map((report) => (
                  <ReportCard key={report.reportId} report={report} />
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-3 pr-4 font-medium">Date</th>
                      <th className="pb-3 pr-4 font-medium">Hemoglobin</th>
                      <th className="pb-3 pr-4 font-medium">Vitamin D</th>
                      <th className="pb-3 pr-4 font-medium">Cholesterol</th>
                      <th className="pb-3 pr-4 font-medium">Blood Sugar</th>
                      <th className="pb-3 pr-4 font-medium">BMI</th>
                      <th className="pb-3 font-medium">Doctor Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
                      <tr key={report.reportId} className="text-slate-700">
                        <td className="py-3 pr-4">
                          {formatDate(report.reportDate)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatValue(report.hemoglobin)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatValue(report.vitaminD)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatValue(report.cholesterol)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatValue(report.bloodSugarFasting)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatValue(report.bmi)}
                        </td>
                        <td className="py-3">
                          {formatValue(report.doctorNotes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {pagination && pagination.totalPages > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page >= pagination.totalPages || loading}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
