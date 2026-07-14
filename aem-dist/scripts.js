const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/js/cards-ggYCtXFX.js","assets/css/cards-DPDB125K.css","assets/js/columns-BFb4YtH4.js","assets/css/columns-C5aIQW4i.css","assets/js/footer-B9hn0Aho.js","assets/js/vendor-BJxH5iqu.js","assets/css/footer-D_57rMDH.css","assets/js/header-C_YAMdkJ.js","assets/css/header-CTFTlgbR.css","assets/js/hero-ooslPPSZ.js","assets/css/hero-C1ok3tpv.css"])))=>i.map(i=>d[i]);
//#region src/utils/metadata.ts
function toClassName(value) {
	return typeof value === "string" ? value.toLowerCase().replace(/[^0-9a-z]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") : "";
}
function toCamelCase(value) {
	return toClassName(value).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
function getMetadata(name, doc = document) {
	const attribute = name.includes(":") ? "property" : "name";
	return [...doc.head.querySelectorAll(`meta[${attribute}="${name}"]`)].map((meta) => meta.content).join(", ");
}
//#endregion
//#region src/utils/blocks.ts
function readBlockConfig(block) {
	const config = {};
	block.querySelectorAll(":scope > div").forEach((row) => {
		const cols = [...row.children];
		if (cols.length < 2) return;
		const key = toClassName(cols[0].textContent || "");
		const valueCol = cols[1];
		const link = valueCol.querySelector("a[href]");
		const img = valueCol.querySelector("img");
		if (link) config[key] = link.href;
		else if (img) config[key] = img.src;
		else config[key] = valueCol.textContent?.trim() || "";
	});
	return config;
}
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = /* @__PURE__ */ (function detectScriptRel() {
	const relList = typeof document !== "undefined" && document.createElement("link").relList;
	return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
})();
var assetsURL = function(dep) {
	return "/aem-dist/" + dep;
};
var seen = {};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		const links = document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		function importMetaResolve(specifier) {
			if (import.meta.resolve) return import.meta.resolve(specifier);
			return new URL(specifier, new URL("../../../src/node/plugins/importAnalysisBuild.ts", import.meta.url)).href;
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep, importerUrl);
			dep = importMetaResolve(dep);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				if (link.href === dep && (!isCss || link.rel === "stylesheet")) return;
			}
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region src/aem.ts
var trustedHtmlPolicy;
var blockModules = /* #__PURE__ */ Object.assign({
	"./blocks/cards/cards.ts": () => __vitePreload(() => import("./assets/js/cards-ggYCtXFX.js"), __vite__mapDeps([0,1])),
	"./blocks/columns/columns.ts": () => __vitePreload(() => import("./assets/js/columns-BFb4YtH4.js"), __vite__mapDeps([2,3])),
	"./blocks/footer/footer.tsx": () => __vitePreload(() => import("./assets/js/footer-B9hn0Aho.js"), __vite__mapDeps([4,5,6])),
	"./blocks/header/header.tsx": () => __vitePreload(() => import("./assets/js/header-C_YAMdkJ.js"), __vite__mapDeps([7,5,8])),
	"./blocks/hero/hero.tsx": () => __vitePreload(() => import("./assets/js/hero-ooslPPSZ.js"), __vite__mapDeps([9,10]))
});
function setup() {
	window.hlx = window.hlx || {};
	window.hlx.RUM_MASK_URL = "full";
	window.hlx.RUM_MANUAL_ENHANCE = true;
	window.hlx.codeBasePath = "/aem-dist/".replace(/\/$/, "");
	window.hlx.lighthouse = new URLSearchParams(window.location.search).get("lighthouse") === "on";
}
function decorateTemplateAndTheme() {
	const addClasses = (value) => {
		value.split(",").map((item) => toClassName(item.trim())).filter(Boolean).forEach((item) => document.body.classList.add(item));
	};
	const template = getMetadata("template");
	const theme = getMetadata("theme");
	if (template) addClasses(template);
	if (theme) addClasses(theme);
}
function decorateIcon(span, prefix = "", alt = "") {
	if (span.hasChildNodes()) return;
	const iconName = [...span.classList].find((className) => className.startsWith("icon-"))?.substring(5);
	if (!iconName) return;
	const img = document.createElement("img");
	img.dataset.iconName = iconName;
	img.src = `${window.hlx.codeBasePath}${prefix}/icons/${iconName}.svg`;
	img.alt = alt;
	img.loading = "lazy";
	img.width = 16;
	img.height = 16;
	span.append(img);
}
function decorateIcons(element, prefix = "") {
	element.querySelectorAll("span.icon").forEach((span) => decorateIcon(span, prefix));
}
function wrapTextNodes(block) {
	const validWrappers = /* @__PURE__ */ new Set([
		"P",
		"PRE",
		"UL",
		"OL",
		"PICTURE",
		"TABLE",
		"H1",
		"H2",
		"H3",
		"H4",
		"H5",
		"H6"
	]);
	block.querySelectorAll(":scope > div > div").forEach((cell) => {
		if (!cell.hasChildNodes()) return;
		const first = cell.firstElementChild;
		const isWrapped = !!first && validWrappers.has(first.tagName);
		const mixedPicture = first?.tagName === "PICTURE" && (cell.children.length > 1 || !!cell.textContent?.trim());
		if (isWrapped && !mixedPicture) return;
		const wrapper = document.createElement("p");
		wrapper.append(...cell.childNodes);
		cell.append(wrapper);
	});
}
function decorateSections(main) {
	main.querySelectorAll(":scope > div:not([data-section-status])").forEach((section) => {
		const wrappers = [];
		let defaultContent = false;
		[...section.children].forEach((child) => {
			if (child.tagName === "DIV" || !defaultContent) {
				const wrapper = document.createElement("div");
				wrappers.push(wrapper);
				defaultContent = child.tagName !== "DIV";
				if (defaultContent) wrapper.classList.add("default-content-wrapper");
			}
			wrappers.at(-1)?.append(child);
		});
		wrappers.forEach((wrapper) => section.append(wrapper));
		section.classList.add("section");
		section.dataset.sectionStatus = "initialized";
		section.style.display = "none";
		const metadata = section.querySelector("div.section-metadata");
		if (!metadata) return;
		Object.entries(readBlockConfig(metadata)).forEach(([key, value]) => {
			const metadataValue = Array.isArray(value) ? value.join(",") : value;
			if (!metadataValue) return;
			if (key === "style") metadataValue.split(",").map((item) => toClassName(item.trim())).filter(Boolean).forEach((item) => section.classList.add(item));
			else if (key === "sectionid") section.id = metadataValue;
			else if (key === "aria-label") section.setAttribute("aria-label", metadataValue);
			else if (key === "backgroundimage") {
				section.dataset.backgroundimage = metadataValue;
				section.style.backgroundImage = `url("${metadataValue}")`;
				section.classList.add("bg-image");
			} else section.dataset[toCamelCase(key)] = metadataValue;
		});
		metadata.parentElement?.remove();
	});
}
function decorateBlock(block) {
	const blockName = block.classList[0];
	if (!blockName || block.dataset.blockStatus || blockName === "section-metadata") return;
	block.classList.add("block");
	block.dataset.blockName = blockName;
	block.dataset.blockStatus = "initialized";
	wrapTextNodes(block);
	block.parentElement?.classList.add(`${blockName}-wrapper`);
	block.closest(".section")?.classList.add(`${blockName}-container`);
}
function decorateBlocks(main) {
	main.querySelectorAll("div.section > div > div").forEach(decorateBlock);
}
function appendHtml(element, html) {
	if (!html) return;
	trustedHtmlPolicy ||= window.trustedTypes?.createPolicy("aem-build-block", { createHTML: (value) => value });
	element.insertAdjacentHTML("beforeend", trustedHtmlPolicy ? trustedHtmlPolicy.createHTML(html) : html);
}
function buildBlock(blockName, content) {
	const table = Array.isArray(content) ? content : [[content]];
	const block = document.createElement("div");
	block.classList.add(blockName);
	table.forEach((row) => {
		const rowElement = document.createElement("div");
		row.forEach((column) => {
			const columnElement = document.createElement("div");
			(typeof column === "object" && "elems" in column ? column.elems : [column]).forEach((value) => {
				if (typeof value === "string") appendHtml(columnElement, value);
				else if (value) columnElement.append(value);
			});
			rowElement.append(columnElement);
		});
		block.append(rowElement);
	});
	return block;
}
async function loadBlock(block) {
	const status = block.dataset.blockStatus;
	if (status === "loading" || status === "loaded") return block;
	const blockName = block.dataset.blockName;
	if (!blockName) return block;
	const modulePath = [
		"tsx",
		"ts",
		"jsx",
		"js"
	].map((extension) => `./blocks/${blockName}/${blockName}.${extension}`).find((path) => path in blockModules);
	block.dataset.blockStatus = "loading";
	if (!modulePath) {
		block.dataset.blockStatus = "error";
		console.warn(`No Vite block found for "${blockName}"`);
		return block;
	}
	try {
		await (await blockModules[modulePath]()).default?.(block);
		block.dataset.blockStatus = "loaded";
	} catch (error) {
		block.dataset.blockStatus = "error";
		console.error(`Failed to load block "${blockName}"`, error);
	}
	return block;
}
async function loadHeader(header = document.querySelector("body header")) {
	if (!header) return null;
	const block = buildBlock("header", "");
	header.append(block);
	decorateBlock(block);
	return loadBlock(block);
}
async function loadFooter(footer = document.querySelector("body footer")) {
	if (!footer) return null;
	const block = buildBlock("footer", "");
	footer.append(block);
	decorateBlock(block);
	return loadBlock(block);
}
function prioritizeFirstImage(root) {
	const image = root.querySelector("img");
	if (image) {
		image.loading = "eager";
		image.fetchPriority = "high";
	}
	return image;
}
async function waitForFirstImage(section) {
	const image = prioritizeFirstImage(section);
	await new Promise((resolve) => {
		if (!image || image.complete) resolve();
		else {
			image.addEventListener("load", () => resolve(), { once: true });
			image.addEventListener("error", () => resolve(), { once: true });
		}
	});
}
async function loadSection(section, callback) {
	const status = section.dataset.sectionStatus;
	if (status && status !== "initialized") return section;
	section.dataset.sectionStatus = "loading";
	for (const block of section.querySelectorAll("div.block")) await loadBlock(block);
	await callback?.(section);
	section.dataset.sectionStatus = "loaded";
	section.style.display = "";
	return section;
}
async function loadSections(element) {
	for (const section of element.querySelectorAll("div.section")) await loadSection(section);
}
setup();
//#endregion
//#region src/scripts.ts
function decorateButtons(main) {
	main.querySelectorAll("p a[href]").forEach((anchor) => {
		anchor.title = anchor.title || anchor.textContent || "";
		const paragraph = anchor.closest("p");
		const text = anchor.textContent?.trim() || "";
		if (!paragraph || anchor.querySelector("img") || paragraph.textContent?.trim() !== text) return;
		try {
			if (new URL(anchor.href).href === new URL(text, window.location.href).href) return;
		} catch {}
		const strong = anchor.closest("strong");
		const emphasis = anchor.closest("em");
		if (!strong && !emphasis) return;
		paragraph.className = "button-wrapper";
		anchor.className = "button";
		if (strong && emphasis) anchor.classList.add("accent");
		else if (strong) anchor.classList.add("primary");
		else anchor.classList.add("secondary");
		(strong && emphasis ? strong.contains(emphasis) ? strong : emphasis : strong || emphasis)?.replaceWith(anchor);
	});
}
function decorateMain(main) {
	decorateIcons(main);
	decorateSections(main);
	decorateBlocks(main);
	decorateButtons(main);
}
async function loadEager(doc) {
	document.documentElement.lang = "en";
	decorateTemplateAndTheme();
	const main = doc.querySelector("main");
	if (!main) return;
	decorateMain(main);
	document.body.classList.add("appear");
	const firstSection = main.querySelector(".section");
	if (firstSection) await loadSection(firstSection, waitForFirstImage);
}
async function loadLazy(doc) {
	loadHeader(doc.querySelector("header"));
	const main = doc.querySelector("main");
	if (main) await loadSections(main);
	(window.location.hash ? doc.getElementById(window.location.hash.substring(1)) : null)?.scrollIntoView();
	loadFooter(doc.querySelector("footer"));
}
/**
* Loads everything that happens a lot later,
* without impacting the user experience.
*/
function loadDelayed() {
	window.setTimeout(() => __vitePreload(() => import("./assets/js/delayed-BvRk9kiK.js"), []), 3e3);
}
/**
* Loads work that can be postponed without affecting the user experience.
*/
async function loadPage() {
	await loadEager(document);
	await loadLazy(document);
	loadDelayed();
}
loadPage();
(async function loadDa() {
	if (!new URL(window.location.href).searchParams.get("dapreview")) return;
	const daPreviewUrl = "https://da.live/scripts/dapreview.js";
	__vitePreload(async () => {
		const { default: daPreview } = await import(
			/* @vite-ignore */
			daPreviewUrl
);
		return { default: daPreview };
	}, []).then(({ default: daPreview }) => daPreview(loadPage));
})();
//#endregion

//# sourceMappingURL=scripts.js.map