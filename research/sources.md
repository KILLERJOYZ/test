# Source register and research limitations

Access/research date: 10 November 2026. All sources below are first-party publishers, official framework/library documentation, or the retailer's own policy pages. Linked documentation can change after this date. A published capability is not evidence that it was tested in this project.

## Reference sites

| ID | Source | Evidence used / limitation |
|---|---|---|
| C01 | [GSMArena FAQ](https://www.gsmarena.com/m/faq.php3) | Phone Finder, keyword filtering, coverage guidance, manufacturer/secondary sourcing, corrections. Accessible. |
| C02 | [GSMArena terms](https://www.gsmarena.com/m/terms.php3) | Price-comparison affiliate disclosure and editorial separation; copyrighted material and as-is information. Accessible page may be an older version. |
| C03 | [Bestlaptop.deals home](https://www.bestlaptop.deals/) | Region selector, laptop-oriented navigation and deal presentation. Page observed; marketing claims not independently verified. |
| C04 | [Laptop Picker](https://www.bestlaptop.deals/laptop-picker) | Up to three ordered purposes, budget question, affiliate disclosure. Matching behavior not exercised. |
| C05 | [Deal filters](https://www.bestlaptop.deals/recommendations/Crazy-Deals) | Use-case, price, deal-type, and technical filter labels. Results and deal scoring not audited. |
| C06 | [Example laptop product](https://www.bestlaptop.deals/products/lenovo-yoga-7i-2-in-1-16-2025) | Pros/cons, variants, test/review links, availability and price-history entry point. History accuracy not tested; displayed price is not a Vietnam quote. |
| C07 | [About Just Josh team](https://www.bestlaptop.deals/about) | Publisher's description of expertise and practical product use. Self-description, not independent quality verification. |
| C08 | [Programming recommendations](https://www.bestlaptop.deals/recommendations/Best-Laptops-for-Coding?location=us) | Needs-oriented lists, configuration summaries, history labels, and affiliate disclosure. No product recommendations in this report rely on its displayed live prices. |
| C09 | [PhoneArena rating method](https://www.phonearena.com/howdowerate) | Twelve-category weighted score and explicit exclusion of price. Published page says updated February 2026. |
| C10 | [PhoneArena comparison tool](https://www.phonearena.com/phones/compare) | Specs comparison and size-comparison navigation. Interactive comparison not tested. |
| C11 | [PhoneArena battery method](https://www.phonearena.com/howdowerate/battery) | Declared battery testing process and links to licensing/company information. No calibration against other publishers performed. |
| C12 | [PhoneArena display method](https://www.phonearena.com/howdowerate/display) | Brightness/test conditions and display measurement approach. Published method, not independently replicated. |
| C13 | [PhoneArena database licensing](https://www.phonearena.com/database) | Commercial specification XML-feed offering. No quote, credentials, sample schema, contract, or coverage audit obtained. |
| C14 | [PhoneArena terms](https://www.phonearena.com/terms_of_use) | Public terms include prohibition of automated scraping/indexing. Production access should use an applicable agreement. |
| C15 | [PhoneArena ethics](https://www.phonearena.com/ethics-statement) | Publisher's policy on editorial independence, advertising, affiliate links, and sponsored content. |

## Frameworks, platform design, and performance

| ID | Source | Evidence used / limitation |
|---|---|---|
| T01 | [Microsoft RNW architecture](https://github.com/microsoft/react-native-windows-samples/blob/main/docs/new-architecture.md) | Composition versus XAML distinction. Some roadmap statements can lag releases; cross-checked with T02 rather than treating every statement as current. |
| T02 | [Microsoft RNW 0.82 announcement](https://devblogs.microsoft.com/react-native/%F0%9F%9A%80react-native-windows-v0-82-is-here/) | April 2026 release announcement: Fabric-only architecture and native XAML hosting support for modules. This is a capability milestone, not a latest-version recommendation. |
| T03 | [RNW native components](https://microsoft.github.io/react-native-windows/docs/native-platform-components/) | TypeScript specs, code generation, C++ native component implementation. Inspected docs identify version 0.85. |
| T04 | [WinUI 3 overview](https://learn.microsoft.com/windows/apps/WinUI) | Native Windows desktop framework. |
| T05 | [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) | Official Compose Material/Expressive implementation guidance. Does not establish an RN wrapper's completeness. |
| T06 | [React Native Paper MD3 guide](https://oss.callstack.com/react-native-paper/docs/guides/migration-guide-to-5.0) | MD3/Material You support. Not used as proof of full Material 3 Expressive parity. |
| T07 | [React Native Fabric components](https://reactnative.dev/docs/fabric-native-components-introduction) | Spec, Codegen, and native UI integration approach. |
| T08 | [Compose in Views](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/compose-in-views) | ComposeView interoperability, disposal, lifecycle, and state considerations. Proposed RN integration still requires a spike. |
| T09 | [React Native platform-specific code](https://reactnative.dev/docs/platform-specific-code.html) | Platform-specific file and detection conventions. |
| T10 | [RNW platform detection](https://microsoft.github.io/react-native-windows/docs/platform/) | Windows extension of platform detection. |
| T11 | [React Native performance](https://reactnative.dev/docs/performance) | Frame budgets, JS/UI threads, and release-build profiling. No app performance has been measured. |
| T12 | [Android Macrobenchmark metrics](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-metrics) | Startup/frame measurement APIs and boundaries. |
| T13 | [TanStack Query useQuery](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useQuery) | Query/network-mode contract. Platform persistence/connectivity package support requires separate validation. |

## Recommendation architecture and catalog/offer inputs

| ID | Source | Evidence used / limitation |
|---|---|---|
| D01 | [Google recommendation-system overview](https://developers.google.com/machine-learning/recommendation/overview/types) | Candidate generation, scoring, and re-ranking pattern. The project's constraints, utilities, and eligibility rules are proposals. |
| D02 | [Lenovo PSREF product reference](https://psref.lenovo.com/product/) | Platform options, model/region limitations, support documentation pattern. Do not assume a generic option list describes a specific SKU. |
| D03 | [Lenovo PSREF search](https://psref.lenovo.com/search/) | Distinction between product names, machine type/part number, configurations, and platform specifications. |
| D04 | [Schema.org Product](https://www.schema.org/Product) | Product/offer vocabulary and property examples, not data rights or verification. |
| D05 | [Schema.org Offer](https://www.schema.org/Offer) | Price, availability, shipping/policy vocabulary. |
| D06 | [eBay Browse API](https://developer.ebay.com/api-docs/buy/static/api-browse.html) | Documented offer/item discovery and seller/shipping information. Future-market candidate only; no integration or approved access established. |
| D07 | [Amazon Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/) | Current documented programmatic catalog option and access prerequisites. Not a recommendation to use legacy PA-API recipes or a confirmed project entitlement. |

## Vietnam purchasing conditions

| ID | Source | Evidence used / limitation |
|---|---|---|
| V01 | [CellphoneS student/teacher offers](https://cellphones.com.vn/uu-dai-sinh-vien-hoc-sinh) | Eligibility-dependent promotions exist; individual live offer terms must be checked separately. |
| V02 | [GearVN trade-in process](https://gearvn.com/pages/thu-cu-doi-moi) | Inspection-dependent final valuation; separate estimates from confirmed cash prices. |
| V03 | [CellphoneS YouTube Affiliate announcement](https://cellphones.com.vn/sforum/cellphones-trien-khai-youtube-affiliate) | Channel-specific affiliate announcement. Does not establish third-party app-feed/API rights. |

## Important access and verification gaps

- GSMArena's main page returned a payment response in the research fetch. Finder/comparison and battery-methodology attempts redirected to inaccessible Tollbit pages. Do not interpret this as an ordinary visitor's experience or bypass those controls.
- GSMArena's accessible FAQ and terms were sufficient for a limited catalog/discovery analysis. Current detailed interactive and measurement-method audits remain open.
- Bestlaptop.deals' robots endpoint could not be fetched. No conclusion about production collection permissions follows from that failure, and no public project feed was verified.
- PhoneArena's terms were located through its footer at `terms_of_use`; the guessed `/terms` path was inaccessible. Use the actual source link above.
- Source content was read through search/document fetches. No browser session, shopping cart, transaction, account signup, retailer contact, feed import, or commercial agreement was completed.
- No benchmark values, current laptop/phone rankings, or checkout-ready prices are claimed by the report. Illustrative acceptance targets, schedules, and sample sizes are proposals.
- Architecture recommendations require a native integration prototype, exact dependency selection, and physical-device validation. Framework documentation alone does not prove that the proposed application meets its performance goals.
