import { twMerge } from "tailwind-merge"

export const classNames = (...classes: unknown[]): string => {
	return twMerge(classes.filter(Boolean).join(" "))
}
