const getUrl = (site = 'frontend') => {
  const protocol = 'http';

  return site === 'backend'
    ? `${protocol}://localhost:${process.env.PORT}`
    : `${protocol}://localhost:${process.env.CLIENT_PORT}`;
}

module.exports = getUrl;