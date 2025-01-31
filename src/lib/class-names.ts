export const classNames = (...classes: never[]): string => {
  return classes.filter(Boolean).join(' ')
}
