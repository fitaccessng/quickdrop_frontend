export const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 2,
});

export const formatMoney = (value) => currency.format(value ?? 0);

export const asArray = (value, ...keys) => {
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return [];
};

export const classNames = (...classes) => classes.filter(Boolean).join(" ");

export const groupBy = (items, key) =>
  items.reduce((acc, item) => {
    const bucket = item[key];
    acc[bucket] = acc[bucket] ? [...acc[bucket], item] : [item];
    return acc;
  }, {});
