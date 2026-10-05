import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out" });

let cleanup: (() => void) | undefined;

export function initSite() {
	cleanup?.();
	cleanup = mount();
}

function mount() {
	const lenis = new Lenis({
		autoRaf: false,
		anchors: true,
		stopInertiaOnNavigate: true,
	});

	lenis.on("scroll", ScrollTrigger.update);

	const onTick = (time: number) => {
		lenis.raf(time * 1000);
	};
	gsap.ticker.add(onTick);
	gsap.ticker.lagSmoothing(0);

	const header = document.querySelector<HTMLElement>(".site-header");
	const dock = document.querySelector<HTMLElement>(".dock");
	const headerTrigger = ScrollTrigger.create({
		start: 24,
		onToggle: (self) => {
			header?.classList.toggle("is-scrolled", self.isActive);
		},
	});
	const dockTrigger = ScrollTrigger.create({
		start: 120,
		onToggle: (self) => {
			dock?.classList.toggle("is-on", self.isActive);
		},
	});
	header?.classList.toggle("is-scrolled", window.scrollY > 24);
	dock?.classList.toggle("is-on", window.scrollY > 120);

	const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
	const panel = document.querySelector<HTMLElement>(".nav-panel");
	const label = toggle?.querySelector(".sr-only");
	const main = document.querySelector("main");
	const footer = document.querySelector(".site-footer");

	const setNav = (open: boolean) => {
		if (!toggle || !panel) return;
		toggle.classList.toggle("is-open", open);
		toggle.setAttribute("aria-expanded", String(open));
		panel.classList.toggle("is-open", open);
		panel.setAttribute("aria-hidden", String(!open));
		panel.toggleAttribute("inert", !open);
		document.body.classList.toggle("nav-open", open);
		if (label) label.textContent = open ? "メニューを閉じる" : "メニューを開く";
		if (open) {
			lenis.stop();
			const links = panel.querySelectorAll("a");
			if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
				gsap.fromTo(
					links,
					{ autoAlpha: 0, y: 18 },
					{ autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, overwrite: true },
				);
			}
			panel.querySelector<HTMLElement>("a")?.focus();
		} else {
			lenis.start();
		}
		main?.toggleAttribute("inert", open);
		footer?.toggleAttribute("inert", open);
	};

	const onToggle = () => {
		setNav(!toggle?.classList.contains("is-open"));
	};

	const onPanelClick = (event: Event) => {
		const target = event.target;
		if (target instanceof Element && target.closest("a")) setNav(false);
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key === "Escape" && toggle?.classList.contains("is-open")) {
			setNav(false);
			toggle.focus();
		}
	};

	const desktopQuery = window.matchMedia("(min-width: 960px)");
	const onDesktopChange = (event: MediaQueryListEvent) => {
		if (event.matches) setNav(false);
	};

	toggle?.addEventListener("click", onToggle);
	panel?.addEventListener("click", onPanelClick);
	document.addEventListener("keydown", onKeydown);
	desktopQuery.addEventListener("change", onDesktopChange);

	const mm = gsap.matchMedia();

	mm.add("(prefers-reduced-motion: no-preference)", () => {
		const tl = gsap.timeline();
		tl.fromTo(
			".hero__kicker",
			{ autoAlpha: 0, y: 16 },
			{ autoAlpha: 1, y: 0, duration: 0.7, immediateRender: true },
		)
			.fromTo(
				".hero__title .line span",
				{ yPercent: 110 },
				{ yPercent: 0, duration: 1.15, stagger: 0.1, ease: "power3.out", immediateRender: true },
				"-=0.4",
			)
			.fromTo(
				".hero__lead",
				{ autoAlpha: 0, y: 18 },
				{ autoAlpha: 1, y: 0, duration: 0.8, immediateRender: true },
				"-=0.7",
			)
			.fromTo(
				".hero__meta li",
				{ autoAlpha: 0, y: 12 },
				{ autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, immediateRender: true },
				"-=0.5",
			)
			.fromTo(
				".hero__actions .btn",
				{ autoAlpha: 0, y: 12 },
				{ autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, immediateRender: true },
				"-=0.4",
			);

		document.documentElement.classList.remove("is-booting");

		gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
			const kind = el.dataset.reveal;

			if (kind === "line") {
				gsap.fromTo(
					el,
					{ scaleX: 0 },
					{
						scaleX: 1,
						duration: 1.15,
						ease: "power3.inOut",
						scrollTrigger: { trigger: el, start: "top 90%", once: true },
					},
				);
				return;
			}

			if (kind === "group") {
				gsap.fromTo(
					el.children,
					{ autoAlpha: 0, y: 24 },
					{
						autoAlpha: 1,
						y: 0,
						duration: 0.85,
						stagger: 0.1,
						scrollTrigger: { trigger: el, start: "top 86%", once: true },
					},
				);
				return;
			}

			if (kind === "image") {
				const img = el.querySelector("img");
				if (img) {
					gsap.fromTo(
						img,
						{ scale: 1.08 },
						{
							scale: 1,
							duration: 1.4,
							ease: "power3.out",
							scrollTrigger: { trigger: el, start: "top 82%", once: true },
						},
					);
				}
				gsap.fromTo(
					el,
					{ autoAlpha: 0 },
					{
						autoAlpha: 1,
						duration: 0.9,
						scrollTrigger: { trigger: el, start: "top 82%", once: true },
					},
				);
				return;
			}

			gsap.fromTo(
				el,
				{ autoAlpha: 0, y: 28 },
				{
					autoAlpha: 1,
					y: 0,
					duration: 1,
					scrollTrigger: { trigger: el, start: "top 86%", once: true },
				},
			);
		});
	});

	mm.add("(min-width: 960px) and (prefers-reduced-motion: no-preference)", () => {
		gsap.fromTo(
			".hero__img",
			{ yPercent: -4 },
			{
				yPercent: 5,
				ease: "none",
				scrollTrigger: {
					trigger: ".hero",
					start: "top top",
					end: "bottom top",
					scrub: true,
				},
			},
		);
	});

	const refresh = () => ScrollTrigger.refresh();
	window.addEventListener("load", refresh, { once: true });
	void document.fonts?.ready.then(refresh);

	return () => {
		toggle?.removeEventListener("click", onToggle);
		panel?.removeEventListener("click", onPanelClick);
		document.removeEventListener("keydown", onKeydown);
		desktopQuery.removeEventListener("change", onDesktopChange);
		setNav(false);
		headerTrigger.kill();
		dockTrigger.kill();
		mm.revert();
		gsap.ticker.remove(onTick);
		lenis.destroy();
	};
}

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		cleanup?.();
		cleanup = undefined;
	});
}
