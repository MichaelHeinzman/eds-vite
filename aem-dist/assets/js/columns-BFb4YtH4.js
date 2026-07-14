//#region src/blocks/columns/columns.ts
function decorate(block) {
	[...block.children].forEach((row) => {
		row.classList.add("columns-row");
		[...row.children].forEach((column) => {
			column.classList.add("columns-column");
			if (column.querySelector("picture")) column.classList.add("columns-image-column");
			const image = column.querySelector("img");
			if (image) image.loading = "lazy";
		});
	});
}
//#endregion
export { decorate as default };

//# sourceMappingURL=columns-BFb4YtH4.js.map