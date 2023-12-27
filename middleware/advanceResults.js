const advanceResults = (model, populate) => async (req, res, next) => {
  let query;
  const pagination = {};
  const data = await model.find();
  const total = await model.countDocuments();
  if (Object.keys(req?.query).length > 0) {
    let results;
    const reqQuery = { ...req.query };

    const removeFeilds = ["select", "sort", "limit", "page"];

    removeFeilds.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)/g,
      (match) => `$${match}`
    );

    query = model.find(JSON.parse(queryStr));

    if (req.query.select) {
      const select = req.query.select.split(",").join(" ");
      query = query.select(select);
    }

    if (req.query.sort) {
      const sort = req.query.sort.split(",").join(" ");
      query = query.sort(sort);
    } else {
      query = query.sort("-createdAt");
    }

    if (req?.query?.page && req?.query?.limit) {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 25;
      const startIndex = (page - 1) * limit;

      const endIndex = page * limit;

      query = query.skip(startIndex).limit(limit);

      if (populate) {
        query = query.populate(populate);
      }

      results = await query;
      const totalPages = Math.ceil(total / limit);
      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }
      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }
      pagination.current = {
        page,
        limit,
      };
      pagination.totalPages = totalPages;
    }
    res.data = {
      status: "success",
      pagination,
      total,
      count: results?.length,
      data: results,
    };
  } else {
    res.data = {
      status: "success",
      count: data?.length,
      data: data,
    };
  }
  next();
};

module.exports = advanceResults;
