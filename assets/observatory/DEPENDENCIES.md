# Local runtime dependencies

The observatory loads its scripts and fonts from this repository. No third-party runtime CDN is required for the redesigned pages.

| Dependency | Version | Source / license |
| --- | --- | --- |
| Three.js | 0.180.0 | https://github.com/mrdoob/three.js — MIT, `vendor/THREE-LICENSE.txt` |
| GSAP | 3.13.0 | https://gsap.com/standard-license/ — GSAP Standard License; copyright/license link retained in the distributed file |
| Marked | 16.3.0 | https://github.com/markedjs/marked — MIT, `vendor/MARKED-LICENSE.txt` |
| DOMPurify | 3.2.7 | https://github.com/cure53/DOMPurify — MPL-2.0 OR Apache-2.0, `vendor/DOMPURIFY-LICENSE.txt` |
| Newsreader | Google Fonts distribution | https://github.com/productiontype/NewsReader — SIL OFL 1.1 |
| Noto Sans SC | Google Fonts distribution | https://github.com/notofonts/noto-cjk — SIL OFL 1.1 |
| Noto Serif SC | Existing repository font | https://github.com/notofonts/noto-cjk — SIL OFL 1.1 |
| IBM Plex Mono | Google Fonts distribution | https://github.com/IBM/plex — SIL OFL 1.1 |

Font license copies are in `fonts/`. Noto Sans SC is split by Unicode range, so a browser requests only the slices required by the displayed content. `fonts.css` preserves those ranges. The 3D object, procedural environment, star field, SVG artwork, and motion composition were created in code for this site.

`scene.js` is the scene entry. `chapter-scene.js` contains the renderer, material and transition choreography; `sculptures.js` constructs the five compatible geometric poses. `scene.bundle.js` is its browser distribution, bundled and minified with esbuild 0.25.10. Three.js source files remain available in `vendor/` for reproducibility. The deployed page requests the bundle, not the unbundled source files.

To rebuild after changing the scene, use an esbuild installation of that version:

```sh
esbuild assets/observatory/scene.js --bundle --minify --format=esm --target=es2020 --legal-comments=inline --outfile=assets/observatory/scene.bundle.js
```

Deployment is static; a server-side build is not required. Existing independent poetry pages and the government parody keep their own original assets and dependency behavior.
