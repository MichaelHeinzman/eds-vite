import "./cards.css";

export default function decorate(block: HTMLElement) {
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
