const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

function mapClientRow(row) {
  const clientId = Number(row.client_id);
  const email = row.email;

  if (!row.client_id || !email || Number.isNaN(clientId)) {
    return null;
  }

  const age =
    row.age != null && row.age !== "" ? Number(row.age) : null;

  return {
    clientId,
    fullName: row.full_name || "",
    email: String(email),
    mobile: row.mobile || null,
    city: row.city || null,
    state: row.state || null,
    age: age != null && !Number.isNaN(age) ? age : null,
    gender: row.gender || null,
    occupation: row.occupation || null,
    healthCondition: row.health_condition || null,
    beautyGoal: row.beauty_goal || null,
  };
}

function toNumber(value) {
  if (value == null || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function parseReportDate(value) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function mapHealthReportRow(row) {
  if (!row.report_id || !row.client_id || !row.report_date) {
    return null;
  }

  const clientId = Number(row.client_id);
  const reportDate = parseReportDate(row.report_date);

  if (Number.isNaN(clientId) || !reportDate) {
    return null;
  }

  return {
    reportId: String(row.report_id),
    clientId,
    reportDate,
    hemoglobin: toNumber(row.hemoglobin),
    vitaminD: toNumber(row.vitamin_d),
    cholesterol: toNumber(row.cholesterol),
    bloodSugarFasting: toNumber(row.blood_sugar_fasting),
    creatinine: toNumber(row.creatinine),
    urineProtein: row.urine_protein || null,
    bmi: toNumber(row.bmi),
    doctorNotes: row.doctor_notes || null,
  };
}

async function getUsers(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, city, condition } = req.query;
    const where = {};

    if (city) {
      where.city = city;
    }

    if (condition) {
      where.healthCondition = condition;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const clientId = Number(req.params.clientId);

    if (Number.isNaN(clientId)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const client = await prisma.client.findUnique({
      where: { clientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            clientId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
}

async function getUserReports(req, res, next) {
  try {
    const clientId = Number(req.params.clientId);

    if (Number.isNaN(clientId)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const client = await prisma.client.findUnique({
      where: { clientId },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const reports = await prisma.healthReport.findMany({
      where: { clientId },
      orderBy: { reportDate: "desc" },
    });

    res.json(reports);
  } catch (error) {
    next(error);
  }
}

async function uploadExcel(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    if (!workbook.SheetNames.includes("clients")) {
      return res.status(400).json({ message: 'Sheet "clients" is missing' });
    }

    if (!workbook.SheetNames.includes("health_reports")) {
      return res
        .status(400)
        .json({ message: 'Sheet "health_reports" is missing' });
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.clients);

    let skippedClients = 0;
    const clientsData = [];

    for (const row of rows) {
      const clientData = mapClientRow(row);

      if (!clientData) {
        skippedClients++;
        continue;
      }

      clientsData.push(clientData);
    }

    const defaultPassword =
      process.env.PATIENT_DEFAULT_PASSWORD || "Patient@123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    let importedClients = 0;
    let createdUsers = 0;

    if (clientsData.length > 0) {
      const clientResult = await prisma.client.createMany({
        data: clientsData,
        skipDuplicates: true,
      });
      importedClients = clientResult.count;

      const usersData = clientsData.map((client) => ({
        email: client.email,
        passwordHash,
        role: "USER",
        clientId: client.clientId,
      }));

      const userResult = await prisma.user.createMany({
        data: usersData,
        skipDuplicates: true,
      });
      createdUsers = userResult.count;
    }

    res.json({
      message: "Clients imported successfully",
      importedClients,
      skippedClients,
      createdUsers,
    });
  } catch (error) {
    next(error);
  }
}

async function uploadHealthReports(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    if (!workbook.SheetNames.includes("health_reports")) {
      return res
        .status(400)
        .json({ message: 'Sheet "health_reports" is missing' });
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.health_reports);

    let skippedReports = 0;
    const reportsData = [];

    for (const row of rows) {
      const reportData = mapHealthReportRow(row);

      if (!reportData) {
        skippedReports++;
        continue;
      }

      reportsData.push(reportData);
    }

    let insertedReports = 0;

    if (reportsData.length > 0) {
      const result = await prisma.healthReport.createMany({
        data: reportsData,
        skipDuplicates: true,
      });
      insertedReports = result.count;
    }

    res.json({
      message: "Health reports uploaded successfully",
      insertedReports,
      skippedReports,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  getUserReports,
  uploadExcel,
  uploadHealthReports,
};
