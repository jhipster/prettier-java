export function getCliName(option) {
  return "--" + option.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
