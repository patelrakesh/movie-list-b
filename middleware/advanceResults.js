const advanceResults = (model, populate) => async (req, res, next) => {
  let query;
  const pagination = {};
  const data = await model.find();
  const total = await model.countDocuments();
  if (Object.keys(req?.query).length > 0) {
    let results;
    const reqQuery = { ...req.query };

    //Feild to exclude

    const removeFeilds = ["select", "sort", "limit", "page"];

    removeFeilds.forEach((param) => delete reqQuery[param]);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);

    //Create operators ($gt,gte,lt,lte)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)/g,
      (match) => `$${match}`
    );

    //Finding resource
    query = model.find(JSON.parse(queryStr));

    //Select
    if (req.query.select) {
      const select = req.query.select.split(",").join(" ");
      query = query.select(select);
    }

    //Sort
    if (req.query.sort) {
      const sort = req.query.sort.split(",").join(" ");
      query = query.sort(sort);
    } else {
      query = query.sort("-createdAt");
    }

    //Pagination

    if (req?.query?.page && req?.query?.limit) {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 25;
      const startIndex = (page - 1) * limit;

      const endIndex = page * limit;

      query = query.skip(startIndex).limit(limit);

      if (populate) {
        query = query.populate(populate);
      }

      //Execute Query
      results = await query;

      // Pagination Result

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
