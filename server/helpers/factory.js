const sql = require("./db");

class LureDb {
  constructor(c) { this.sql = c; }

  prepare = (body) => {
    const keys = Object.keys(body);
    const values = keys.map(key => body[key]);

    return { keys, values };
  }

  count = async (table) => {
    const [results] = await this.sql.execute(`SELECT COUNT(*) as count FROM ${table}`);
    return results;
  }

  findMany = async (table) => {
    const [results] = await this.sql.query(`SELECT * FROM ${table}`);
    return results;
  }

  findById = async (table, id) => {
    const [[result]] = await this.sql.execute(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return result;
  }

  create = async (table, body) => {
    const { keys, values } = this.prepare(body);

    const [result] = await this.sql.query(
      `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(_ => '?').join(", ")})`,
      [...values]
    );

    return result;
  }

  updateById = async (table, body, id) => {
    const { keys, values } = this.prepare(body);

    const [result] = await this.sql.query(
      `UPDATE ${table} SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE id = ?`,
      [...values, id]
    );

    return result;
  }

  deleteById = async (table, id) => {
    const [result] = await this.sql.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return result;
  }
}

exports.LureDb = new LureDb(sql);