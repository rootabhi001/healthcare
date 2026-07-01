import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { clearAuth, getUser } from "../utils/auth";

function StatusMessage({ message, type = "success" }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-red-50 border-red-200 text-red-600";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {message}
    </div>
  );
}

function UploadSection({ title, description, file, onFileChange, onUpload, loading, message }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">{description}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => onFileChange(e.target.files[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
        />
        <button
          type="button"
          onClick={onUpload}
          disabled={!file || loading}
          className="shrink-0 rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {message && (
        <div className="mt-4">
          <StatusMessage {...message} />
        </div>
      )}
    </section>
  );
}

function ReportsModal({ client, reports, loading, onClose }) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Health Reports
            </h3>
            <p className="text-sm text-slate-500">{client.fullName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="overflow-auto p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-slate-500">No reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Hemoglobin</th>
                    <th className="pb-3 pr-4 font-medium">Vitamin D</th>
                    <th className="pb-3 pr-4 font-medium">Cholesterol</th>
                    <th className="pb-3 pr-4 font-medium">BMI</th>
                    <th className="pb-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr key={report.reportId} className="text-slate-700">
                      <td className="py-3 pr-4">
                        {new Date(report.reportDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">{report.hemoglobin ?? "—"}</td>
                      <td className="py-3 pr-4">{report.vitaminD ?? "—"}</td>
                      <td className="py-3 pr-4">{report.cholesterol ?? "—"}</td>
                      <td className="py-3 pr-4">{report.bmi ?? "—"}</td>
                      <td className="py-3">{report.doctorNotes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [datasetFile, setDatasetFile] = useState(null);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [datasetMessage, setDatasetMessage] = useState(null);

  const [reportsFile, setReportsFile] = useState(null);
  const [reportsUploadLoading, setReportsUploadLoading] = useState(false);
  const [reportsUploadMessage, setReportsUploadMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [selectedClient, setSelectedClient] = useState(null);
  const [clientReports, setClientReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const { data } = await api.get("/api/admin/users", {
        params: { page, limit: 10, search: debouncedSearch },
      });
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setUsersError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleDatasetUpload() {
    if (!datasetFile) return;

    const formData = new FormData();
    formData.append("file", datasetFile);

    setDatasetLoading(true);
    setDatasetMessage(null);

    try {
      const { data } = await api.post("/api/admin/upload-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDatasetMessage({
        type: "success",
        message: `${data.message} — ${data.importedClients} clients imported, ${data.createdUsers} users created.`,
      });
      setDatasetFile(null);
      fetchUsers();
    } catch (err) {
      setDatasetMessage({
        type: "error",
        message: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setDatasetLoading(false);
    }
  }

  async function handleReportsUpload() {
    if (!reportsFile) return;

    const formData = new FormData();
    formData.append("file", reportsFile);

    setReportsUploadLoading(true);
    setReportsUploadMessage(null);

    try {
      const { data } = await api.post(
        "/api/admin/upload-health-reports",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setReportsUploadMessage({
        type: "success",
        message: `${data.message} — ${data.insertedReports} reports inserted.`,
      });
      setReportsFile(null);
    } catch (err) {
      setReportsUploadMessage({
        type: "error",
        message: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setReportsUploadLoading(false);
    }
  }

  async function handleViewReports(client) {
    setSelectedClient(client);
    setClientReports([]);
    setReportsLoading(true);

    try {
      const { data } = await api.get(
        `/api/admin/users/${client.clientId}/reports`
      );
      setClientReports(data);
    } catch {
      setClientReports([]);
    } finally {
      setReportsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Admin Dashboard
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
        <UploadSection
          title="Import Initial Dataset"
          description='Upload an Excel file with "clients" and "health_reports" sheets.'
          file={datasetFile}
          onFileChange={setDatasetFile}
          onUpload={handleDatasetUpload}
          loading={datasetLoading}
          message={datasetMessage}
        />

        <UploadSection
          title="Upload Health Reports"
          description='Upload an Excel file with a "health_reports" sheet.'
          file={reportsFile}
          onFileChange={setReportsFile}
          onUpload={handleReportsUpload}
          loading={reportsUploadLoading}
          message={reportsUploadMessage}
        />

        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Users</h2>
            <input
              type="search"
              placeholder="Search by name, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {usersError && (
            <div className="mb-4">
              <StatusMessage type="error" message={usersError} />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">City</th>
                  <th className="pb-3 pr-4 font-medium">Health Condition</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((client) => (
                    <tr key={client.clientId} className="text-slate-700">
                      <td className="py-3 pr-4">{client.fullName}</td>
                      <td className="py-3 pr-4">{client.email}</td>
                      <td className="py-3 pr-4">{client.city || "—"}</td>
                      <td className="py-3 pr-4">
                        {client.healthCondition || "—"}
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => handleViewReports(client)}
                          className="rounded-lg border border-teal-300 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
                        >
                          View Reports
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
                total)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page >= pagination.totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <ReportsModal
        client={selectedClient}
        reports={clientReports}
        loading={reportsLoading}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
}
