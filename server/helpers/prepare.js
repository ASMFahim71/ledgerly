function prepare(data) {
  const keys = Object.keys(data);
  const values = keys.map(key => data[key]);

  return { keys, values };
}

module.exports = prepare;