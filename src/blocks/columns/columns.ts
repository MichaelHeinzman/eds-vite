import "./columns.css";

export default function decorate(block: HTMLElement) {
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
