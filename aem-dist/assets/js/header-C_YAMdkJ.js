import { n as u, r as R, t as d } from "./vendor-BJxH5iqu.js";
//#region src/blocks/header/header.tsx
function Header() {
	const [open, setOpen] = d(false);
	return /* @__PURE__ */ u("div", {
		class: "site-header",
		children: [
			/* @__PURE__ */ u("a", {
				class: "site-logo",
				href: "/",
				"aria-label": "AEM EDS Vite Boilerplate home",
				children: "AEM EDS Vite Boilerplate"
			}),
			/* @__PURE__ */ u("button", {
				class: "nav-toggle",
				type: "button",
				"aria-expanded": open,
				"aria-controls": "primary-navigation",
				onClick: () => setOpen((value) => !value),
				children: /* @__PURE__ */ u("span", {
					"aria-hidden": "true",
					children: open ? "Close" : "Menu"
				})
			}),
			/* @__PURE__ */ u("nav", {
				id: "primary-navigation",
				class: open ? "open" : "",
				"aria-label": "Primary navigation",
				children: [/* @__PURE__ */ u("a", {
					href: "https://www.aem.live/tutorial",
					children: "Tutorial"
				}), /* @__PURE__ */ u("a", {
					href: "https://www.aem.live/docs/",
					children: "Documentation"
				})]
			})
		]
	});
}
function decorate(block) {
	R(/* @__PURE__ */ u(Header, {}), block);
}
//#endregion
export { decorate as default };

//# sourceMappingURL=header-C_YAMdkJ.js.map