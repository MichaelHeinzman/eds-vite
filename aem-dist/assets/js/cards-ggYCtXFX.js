//#region src/blocks/cards/cards.ts
function decorate(block) {
	block.setAttribute("role", "list");
	[...block.children].forEach((card) => {
		card.classList.add("cards-card");
		card.setAttribute("role", "listitem");
		const cells = [...card.children];
		const imageCell = cells.find((cell) => cell.querySelector("picture"));
		imageCell?.classList.add("cards-card-image");
		cells.filter((cell) => cell !== imageCell).forEach((cell) => {
			cell.classList.add("cards-card-body");
		});
		const image = imageCell?.querySelector("img");
		if (image) image.loading = "lazy";
	});
}
//#endregion
export { decorate as default };

//# sourceMappingURL=cards-ggYCtXFX.js.map