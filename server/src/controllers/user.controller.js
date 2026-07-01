const prisma = require("../config/prisma");

async function getDashboard(req, res, next) {
  try {
    const clientId = req.user.clientId;

    if (!clientId) {
      return res.status(404).json({ message: "Client profile not found" });
    }

    const [client, latestReport, totalReports] = await Promise.all([
      prisma.client.findUnique({ where: { clientId } }),
      prisma.healthReport.findFirst({
        where: { clientId },
        orderBy: { reportDate: "desc" },
      }),
      prisma.healthReport.count({ where: { clientId } }),
    ]);

    if (!client) {
      return res.status(404).json({ message: "Client profile not found" });
    }

    res.json({
      client,
      latestReport,
      totalReports,
    });
  } catch (error) {
    next(error);
  }
}

async function getLatestReport(req, res, next) {
  try {
    const clientId = req.user.clientId;

    if (!clientId) {
      return res.status(404).json({ message: "Client profile not found" });
    }

    const report = await prisma.healthReport.findFirst({
      where: { clientId },
      orderBy: { reportDate: "desc" },
    });

    if (!report) {
      return res.status(404).json({ message: "No reports found" });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
}

async function getReports(req, res, next) {
  try {
    const clientId = req.user.clientId;

    if (!clientId) {
      return res.status(404).json({ message: "Client profile not found" });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const where = { clientId };

    const [data, total] = await Promise.all([
      prisma.healthReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reportDate: "desc" },
      }),
      prisma.healthReport.count({ where }),
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

module.exports = { getDashboard, getLatestReport, getReports };
