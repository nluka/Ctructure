// From https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
export default function escapeStringForRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
