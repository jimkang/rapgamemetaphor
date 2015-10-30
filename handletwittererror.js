module.exports = function handleTwitterError(error) {
  if (error) {
    console.log('Response status', error.statusCode);
    console.log('Data', error.data);
  }
};

