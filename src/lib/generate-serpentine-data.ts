export const generateSerpentineData = (pixelData: string[], rows: number, cols: number): string[] => {
	const data: string[][] = []

	for (let y = 0; y < rows; y++) {
		const row = []

		for (let x = 0; x < cols; x++) {
			const color = pixelData[y * cols + (y % 2 === 0 ? x : cols - x - 1)]
			row.push(color ? color : "#000000")
		}

		data.push(row)
	}

	return data.flat()
}
