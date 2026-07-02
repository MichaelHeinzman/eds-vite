export function setAuthorDataProps(
  container: HTMLElement | null | undefined,
  label: string,
  name: string,
  type: string,
  model?: string,
  filter?: string,
) {
  if (!container) return;

  const isAuthor =
    window.location.href.includes("author") &&
    window.location.href.includes("adobeaemcloud");
  if (!isAuthor) return;

  container.dataset.aueProp = name;
  container.dataset.aueLabel = label;
  container.dataset.aueType = type;

  if (filter) container.dataset.aueFilter = filter;
  if (model) container.dataset.aueModel = model;
}
