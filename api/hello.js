module.exports = (request, response) => {
  const { name = 'World' } = request.query;
  response.status(200).send(`Hello, ${name}!`);
};
