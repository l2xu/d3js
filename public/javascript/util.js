//make a function that takes a number as input and formates the number to only have 2 decimal places and a dot as thousands separator (e.g. 1.000.000,00)
function formatNumber(number) {
  return number.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export { formatNumber };
