/* eslint-disable lines-between-class-members */
const { LureDb } = require("./factory");

class APIFeatures {
  query;
  queryParams;

  constructor(query, queryParams) {
    this.query = query;
    this.values = [];
    this.queryParams = queryParams;
  }

  /* filter() {
    const queryParams = { ...this.queryParams };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryParams[el]);

    let queryString = JSON.stringify(queryParams);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  } */

  filter(fields, term) {
    if (!term && !term?.length && !fields.length) return '';

    return term ? `${fields.map(
      (field) => `${field} LIKE '%${term}%'`
    ).join(' OR ')}` : '';
  }

  /* sort() {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  } */

  /* limitFields() {
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  } */

  async paginate(table) {
    let { page = 1, limit = 50 } = this.queryParams;
    page *= 1;
    limit *= 1;

    const offset = (page - 1) * limit;

    const totalDocCount = await LureDb.count(table);
    const totalPage = Math.ceil((totalDocCount[0]?.count ?? 0) / limit);

    this.query += ' LIMIT ? OFFSET ?';

    return {
      query: this.query,
      values: [limit, offset],
      pagination: {
        page,
        limit,
        totalPage
      }
    }
  }
}

module.exports = APIFeatures;