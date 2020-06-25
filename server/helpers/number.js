const tryParseInt = (str, defaultValue = NaN) => {
  const res = parseInt(str, 10);
  return isNaN(res) ? defaultValue : res;
}

module.exports = {
  tryParseInt
}