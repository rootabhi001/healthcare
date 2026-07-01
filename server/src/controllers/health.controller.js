async function getHealth(req, res, next) {
  try {
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getHealth };
