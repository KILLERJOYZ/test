# Business Requirements Document
## Vietnam-first AI device buying adviser

| Document control | Value |
|---|---|
| Version / date | 2.0 / 11 November 2026 |
| Status | Draft for stakeholder review; requirements proposed, not signed off |
| Initial market | Vietnam |
| Target clients | Android mobile and Windows desktop |
| Delivery direction | Native feasibility → interaction demo → AI demo → demo decision → production readiness → controlled pilot |
| Companion plan | [Implementation plan](./IMPLEMENTATION_PLAN.md) |
| Traceability | [Requirement and verification register](./project-traceability.json) |

Version 2.0 retains the agreed product direction and adds detailed use cases, independently verifiable acceptance criteria, lifecycle rules, access responsibilities, measurement definitions and decision records. Added detail does not expand the demo boundary or approve the proposed backlog.

Reading guide: sections 1–5 explain the business and scope direction; sections 7–11 catalog requirements and rules; sections 12–15 define governance and sources; sections 16–22 specify the behavior and evidence needed to assess readiness. Implementation mechanics are in the companion plan.

## 1. Purpose and decision requested

Define the business outcomes, complete customer/admin journeys, scope boundaries, business rules and acceptance evidence for an AI-assisted buying adviser. The immediate delivery objective is a demonstrable application. Production implementation follows a recorded demo decision; the demo is not a soft launch with fictional prices presented as purchasable offers.

Reviewers should agree the demo boundary and acceptance criteria first. No sign-off, supplier agreement, native integration result or software delivery is implied by this document. The next phase decision must explicitly identify scope, owner, capacity and unresolved conditions.

## 2. Business problem and opportunity

Purchasing a laptop, phone or desktop can require reconciling unfamiliar specifications, real application needs, similar model names, price conditions and seller policies. A lower advertised price may refer to a different configuration or depend on eligibility, delivery, trade-in or payment conditions. Generic recommendations can miss the buyer's actual tasks and constraints.

The opportunity is to help a person reach a defensible purchasing decision with an understandable shortlist, consequential advantages/disadvantages, comparable offers, evidence and visible uncertainty. The value hypothesis is fewer misunderstood requirements and offers, with less effort to reach a suitable shortlist. Interviews and pilot evaluation must establish whether this value occurs; the research to date has not demonstrated adoption, conversion, market size or willingness to pay.

GSMArena, PhoneArena and bestlaptop.deals inform specification discovery, structured comparison and needs-based selection. A budget/use-case picker alone is not a defensible distinction. The proposed differentiation is a continuous decision based on actual workloads, exact variants and local offer conditions, with explainable exclusions and editable requirements. See the [competitor research](../../research/project-research.md).

## 3. Objectives and success measures

| ID | Business objective | Evidence and measurement |
|---|---|---|
| OBJ-01 | Capture the needs of the current buying decision accurately | User confirms/corrects tasks, ceiling and required applications; measure missed mandatory requirements and correction causes |
| OBJ-02 | Help users choose among suitable exact configurations | Independently review suitability against a fixed reference set; record no-fit handling and errors by workload/budget |
| OBJ-03 | Make the cost and conditions understandable | Users identify payable total, conditional discounts and unknown costs; audit against source/checkout evidence |
| OBJ-04 | Make advice inspectable and correctable | Decisive claims resolve to evidence or explicit assumptions; track invalid claims and correction turnaround |
| OBJ-05 | Provide a usable Android/Windows experience | Complete the same decision on both clients; preserve state, accessibility and responsiveness |
| OBJ-06 | Operate a maintainable, financially bounded service | Track catalog coverage, freshness, source failures, staff effort and model/data cost per useful session |

Demo evaluation uses fictional data and verifies interaction/rule behavior. It cannot establish live-price accuracy or real hardware suitability. A proposed five-person exploratory demo study identifies problems; it does not justify population-level improvement claims. Production usefulness targets must be ratified after baseline research, with sample sizes and denominators reported.

## 4. Stakeholders and actors

| Actor | Responsibility / need |
|---|---|
| Product owner / sponsor | Approve scope, acceptance, funding and transition between stages; named person TBD |
| Buyer / recipient | Specify tasks and constraints, inspect tradeoffs, choose whether/where to buy |
| Family member / payer | Review a shared decision; collaborative approval is a later feature |
| Catalog editor / reviewer | Maintain exact variants, sources, offers and claims; approve publication within assigned authority |
| Recommendation reviewer | Maintain workload rules and evaluate ranking/AI changes |
| Support / operations admin | Resolve reports, monitor failures, maintain service and access controls |
| Engineering, design and QA | Implement, measure and provide acceptance evidence; one person may cover multiple roles |
| Retailer / data provider / future partner | Supply authorized data or services with documented scope and conditions |

Initial buyer segments are proposed: students/office work and mainstream software development, including bounded VM scenarios. High-end creative, engineering, gaming or local AI workloads require adequate evidence before being represented as supported. Occupation prompts clarification; it does not determine specifications by itself.

## 5. Confirmed direction and open choices

Confirmed by the conversation: Vietnam first; expand globally later; Android and Windows first; React Native; actual WinUI 3 approach on Windows and Material 3 Expressive on Android; reusable app-wide components; adaptive, responsive behavior; structured discovery plus contextual AI; needs-driven multiple-choice intake; complete user/admin journeys instead of fragmented features; demo before production.

Proposed sequencing: new laptops first, followed by phones and then PC builds when their data/rules are ready. This narrows the first release, not the long-term product vision. Team, budget, provider, minimum OS/device support, operating targets and supplier permissions remain open.

## 7. User business requirements

Các use case người dùng (STT 1–18) được tối giản và gộp nhóm theo luồng thao tác của người dùng và phản hồi của hệ thống, tối ưu cho phạm vi triển khai Hackathon (4–6 tiếng).

**Thang mức độ ưu tiên (Urgency):**
- **1:** Cần làm đầu tiên (Luồng trải nghiệm cốt lõi cho MVP Hackathon trong 4–6 tiếng)
- **2:** Không cần làm ngay lập tức (Làm bổ sung nếu còn thời gian sau khi hoàn tất nhóm 1)
- **3:** Tính năng trong tương lai (Mở rộng sau Hackathon)
- **0:** Không cần thiết cho phạm vi Hackathon (Lược bỏ để tập trung nguồn lực)

| ID / source STT | Complete journey and acceptance outcome | Urgency |
|---|---|---|
| U01 / 1 | Người dùng vào tab "Explorer", lựa chọn các yêu cầu, lựa chọn giá, hệ thống phản hồi các sản phẩm phù hợp | 1 |
| U02 / 2 | Người dùng nhập từ khóa tìm kiếm hoặc chọn bộ lọc nhanh trên tab "Explorer", hệ thống phản hồi danh sách các sản phẩm và mức giá tương ứng | 1 |
| U03, U05 / 3, 5 | Người dùng nhấn vào một sản phẩm và chọn phiên bản cấu hình, hệ thống hiển thị chi tiết thông số, ưu/nhược điểm, danh sách nơi bán kèm tổng giá dự kiến và liên kết tới trang mua hàng | 1 |
| U04 / 4 | Người dùng chọn 2 sản phẩm để đối chiếu và điều chỉnh tiêu chí ưu tiên, hệ thống hiển thị bảng so sánh trực quan về thông số, giá bán và mức độ đáp ứng nhu cầu | 1 |
| U07 / 7 | Người dùng nhấn lưu sản phẩm hoặc kết quả tư vấn, hệ thống lưu vào thiết bị để xem lại, xóa hoặc chia sẻ bản tóm tắt quyết định | 2 |
| U08 / 8 | Người dùng sử dụng ứng dụng ngay không cần đăng nhập và thao tác trong mục Cài đặt, hệ thống cập nhật tùy chọn hiển thị hoặc xóa dữ liệu lịch sử lưu trên máy | 2 |
| U06 / 6 | Người dùng dán đường dẫn (link) sản phẩm hoặc báo giá có sẵn vào ô kiểm tra, hệ thống trích xuất thông tin và phản hồi đánh giá mức độ phù hợp kèm chi phí thực tế | 3 |
| U09 / 9 | Người dùng đặt mức giá mục tiêu cần theo dõi cho một sản phẩm, hệ thống lưu cấu hình và gửi thông báo khi giá bán giảm chạm ngưỡng | 3 |
| U12, U13 / 12, 13 | Người dùng nhập thông tin thiết bị hiện có hoặc nhu cầu tự ráp PC, hệ thống kiểm tra tính tương thích linh kiện và phản hồi phương án nâng cấp hoặc cấu hình PC hoàn chỉnh | 3 |
| U10, U11, U14 / 10, 11, 14 | Người dùng nhập kế hoạch tài chính trả góp, tìm mua máy cũ hoặc xác nhận đã mua hàng, hệ thống hiển thị bảng tính tiết kiệm, checklist kiểm tra máy cũ hoặc lịch nhắc bảo hành | 0 |
| U15, U16, U17, U18 / 15, 16, 17, 18 | Người dùng tạo kế hoạch mua sắm nhóm/gia đình, định giá thu cũ đổi mới, gửi câu hỏi cho chuyên gia hoặc tìm dịch vụ thuê máy, hệ thống phản hồi các thông tin dịch vụ phụ trợ tương ứng | 0 |

### 7.1 Needs intake rules

Chỉ hỏi các câu hỏi gắn trực tiếp với nhu cầu chọn máy (danh mục thiết bị, ngân sách tối đa, tác vụ sử dụng chính và tối đa 2 ưu tiên phụ). Người dùng tìm kiếm trực tiếp không bắt buộc phải qua bước khảo sát. Khi người dùng thay đổi nhu cầu hoặc mức giá, hệ thống tự động cập nhật lại danh sách sản phẩm gợi ý. Không thu thập thông tin nhạy cảm (mức lương, CCCD, nơi làm việc, vị trí chính xác).

## 8. Admin business requirements

Các use case quản trị (STT 19–36) được tối giản và gộp nhóm theo thao tác của quản trị viên và phản hồi của hệ thống. Trong khuôn khổ Hackathon 4–6 tiếng, ưu tiên nạp dữ liệu mẫu (fixtures/JSON) và cấu hình luật gợi ý thay vì xây dựng cổng quản trị phức tạp.

| ID / source STT | Complete journey and acceptance outcome | Urgency |
|---|---|---|
| A02, A03, A04 / 20, 21, 22 | Quản trị viên nhập hoặc cập nhật danh sách sản phẩm, phiên bản cấu hình và giá bán từ các cửa hàng (qua file dữ liệu hoặc form), hệ thống kiểm tra tính hợp lệ và cập nhật lên danh mục hiển thị | 1 |
| A06, A07 / 24, 25 | Quản trị viên thiết lập bộ câu hỏi khảo sát nhu cầu, luật chấm điểm và câu lệnh (prompt) cho AI, hệ thống áp dụng cấu hình mới để phân tích và phản hồi gợi ý sản phẩm | 1 |
| A09 / 27 | Quản trị viên kiểm tra trạng thái kết nối AI và dữ liệu, hệ thống hiển thị thông báo trạng thái và tự động chuyển sang chế độ gợi ý dự phòng (fallback) khi dịch vụ AI gặp sự cố | 2 |
| A05, A08 / 23, 26 | Quản trị viên xem các báo cáo sai sót thông tin từ người dùng và chỉnh sửa lại thông số/dẫn chứng, hệ thống lưu bản cập nhật và hiển thị thông tin đã đính chính | 3 |
| A11, A12, A14 / 29, 30, 32 | Quản trị viên xem thống kê lượt sử dụng, quản lý chiến dịch báo giá giảm hoặc cập nhật danh mục linh kiện PC, hệ thống tổng hợp số liệu và cập nhật dữ liệu cho các tính năng mở rộng | 3 |
| A01, A10, A13 / 19, 28, 31 | Quản trị viên phân quyền tài khoản nhân sự, cấu hình phát hành phiên bản (rollout) hoặc xử lý yêu cầu trích xuất/xóa dữ liệu cá nhân trên máy chủ, hệ thống kiểm soát quyền truy cập và ghi nhận lịch sử | 0 |
| A15, A16, A17, A18 / 33, 34, 35, 36 | Quản trị viên phê duyệt đối tác dịch vụ, kiểm duyệt nội dung cộng đồng, quản lý chiến dịch quảng cáo hoặc mở rộng danh mục đa quốc gia, hệ thống cập nhật các chính sách vận hành thương mại tương ứng | 0 |

## 9. Mandatory business rules

| ID | Rule |
|---|---|
| BR-01 | Match a purchasable offer to an exact accepted variant; family-name similarity is insufficient. |
| BR-02 | A confirmed total ceiling and mandatory task/OS/peripheral requirements are hard constraints; soft preferences and AI cannot override them. |
| BR-03 | A missing critical requirement/evidence produces clarification, unknown or abstention, not a compatibility pass. Unknown budget does not mean unlimited. |
| BR-04 | Compare totals on the same purchase scope, condition, location and eligibility basis. Include mandatory charges, avoid adding tax already included, and separate uncertain discounts/cashback/trade-in. |
| BR-05 | Expired, unavailable, mismatched or incomplete offers cannot win a verified-cheapest badge. Claims state the checked-store coverage rather than global cheapest. |
| BR-06 | Price and stock assertions carry observation/expiry context; saved data never becomes freshly verified solely because a screen reopened. |
| BR-07 | AI proposes interpretations/explanations using checked records. Model output cannot invent offers, prices, source IDs, URLs or eligibility verdicts. Material profile changes require user confirmation. |
| BR-08 | Explain strengths, limitations and exclusions for the user's actual tasks; performance measurements require exact tested configuration and method context. |
| BR-09 | Source access, retention and reuse must be documented before production publication. Structured markup or public visibility is not a permission grant. |
| BR-10 | Sponsorship and affiliate relationships are disclosed; commercial payments do not bypass eligibility or determine organic suitability ranking. |
| BR-11 | Navigation, sharing and saving preserve exact variant and needs context. Re-evaluate derived results after a confirmed profile/catalog/rule change. |
| BR-12 | Guest discovery remains usable; collect minimum necessary information and request optional permissions at the point of use. |
| BR-13 | Production publication distinguishes draft, in-review, published, suspended and archived states, with actor/reason/revision history and safe reversal. |
| BR-14 | Mandatory PC electrical/physical/firmware compatibility unknowns block a fully-compatible verdict. Reviewed builds precede unrestricted solving. |
| BR-15 | Demo/synthetic and production datasets/environments are visibly and technically separated. Fixtures cannot be published as production offers. |
| BR-16 | A retailer redirect is not proof of purchase. Payment scenarios, service referrals and data handover guidance carry only the capabilities actually provided. |

## 10. Information and integration requirements

| Entity | Minimum business meaning |
|---|---|
| NeedsProfile / Decision | Current recipient/tasks, answer states, ceiling and included equipment, hard constraints, soft priorities, confirmation/revision |
| ProductFamily / Variant | Shared name versus exact model code, configuration, category/region and publication state |
| Evidence / Claim | Source, permitted use, dates, exact measurement context, linked assertion and unresolved conflicts |
| Seller / Offer / PriceObservation | Seller/policy, matched variant/condition, destination, charges/eligibility, stock evidence, dates and total-completeness status |
| RecommendationRun | Confirmed profile revision, catalog snapshot, rule/model version, selected/excluded/unknown results and evidence links |
| SavedDecision | Profile, selected variants, dated offer/evidence references, local ownership and optional future sync state |
| Staff / Review / Correction | Role, assigned decision, publication revision, reason, timestamps and affected records |

Separate specifications, measurements, price observations and seller policy evidence. Store numbers in consistent units, money as integers with explicit currency rules, and format for the client locale. Production integration adapters must be replaceable without changing what a price or variant means.

Potential integrations include authorized manufacturer/specification sources, permitted retailer data, an AI provider, future notification delivery, optional analytics/crash reporting and OS sharing. None is contracted or configured by this BRD. PhoneArena's advertised licensed specification feed is a potential source, not proof of Vietnam offer coverage or acquired rights [S4].

## 11. Nonfunctional requirements and acceptance

All numerical budgets below are proposed targets, not measurements or vendor promises. The team must ratify supported hardware, sample size and test conditions before making release claims.

| ID | Requirement | Acceptance evidence |
|---|---|---|
| NFR-01 | Shared domain/feature contracts with native platform adaptation | Same fixtures produce same business results on Android/Windows; version/dependency matrix and native-control inspection |
| NFR-02 | WinUI 3 Windows approach and Material 3 Expressive Android | Demonstrated selected native controls, theme/input/focus/lifecycle behavior; styling alone does not establish compliance |
| NFR-03 | Adaptive and accessible journeys | Large text, screen reader, keyboard-only Windows, Android Back/IME, narrow/wide windows, text+icon statuses and reduced-motion behavior |
| NFR-04 | Responsive local interaction | Target p95 input acknowledgement <100 ms and cached useful content <300 ms; report sample size, conditions and actual distribution |
| NFR-05 | Bounded startup/render cost | Initial targets: interactive shell <2 s Android / <3 s Windows; smooth scrolling and no sustained growth across repeated navigation; release builds on named hardware |
| NFR-06 | Useful results independent of slow AI | Deterministic result stage remains available; explanation has explicit loading/timeout/fallback; online targets initially 1.5 s filtered results and 8 s complete AI explanation under documented conditions |
| NFR-07 | Secure privileged operations and minimal data exposure | Server-side roles, scoped access, secrets off clients, input/URL validation, redacted diagnostics and tested denial/revocation |
| NFR-08 | Recoverable data and operation | Local persistence/reset; production restoration rehearsal, validated rollback and source-outage handling; RPO/RTO set at G4 |
| NFR-09 | Observable and bounded operating cost | Timings, failures, coverage, freshness and provider usage recorded with minimal personal data; budget thresholds and action owner set at G4 |
| NFR-10 | Maintainable shared components and localization | Stable semantic contracts, consistent units/VND formatting, Vietnamese demo copy; no app-wide rerender per AI token; English expansion through externalized strings |

## 12. Acceptance strategy and decision gates

G0: agree the scoped demo, proposed acceptance baseline, named owners and target hardware. G1: prove essential native input/command/selection integration, state round-trip and release builds on both clients. G2: demonstrate the full D0 path, all mandatory fixture invariants, persistence and failure states. G3: demonstrate live bounded AI, invalid-output rejection and fallback, review exploratory usability findings, and record the sponsor's demo decision. D1 may only be deferred through an explicit scope decision.

G4: confirm permitted sources and retention, sufficient catalog coverage, offer/evidence audit, supported workloads, target hardware, operating capacity and updated budget. G5: review production tests, manual source/price audit, access/restore exercises, user task evidence, unresolved issues and support ownership before broader availability.

No known critical budget/variant/claim-integrity failure may remain unresolved in the agreed acceptance set. Report the set and limits; zero failures in it does not guarantee universal correctness. In a proposed five-person demo study, aim for at least four independently completing the core journey and correctly identifying sample data and uncertain prices; treat failure as a revision signal and never as statistically representative evidence.

## 13. Risks, assumptions and dependencies

| Risk / unresolved assumption | Response and accountable role |
|---|---|
| Native hosting gaps or dependency incompatibility | Front-load G1; engineering records viable boundaries before screen expansion; platform requirement changes need sponsor decision |
| Insufficient local product/offer evidence or unavailable source access | Data lead limits coverage honestly, negotiates/records access and audits a starter catalog before production |
| Wrong variant or conditional price wins ranking | Domain constraints, review/abstention, calculation fixtures and manual checkout-context audit |
| AI produces unsupported advice | Typed proposals, checked evidence IDs, deterministic decisions, validation and fallbacks; recommendation reviewer owns regressions |
| Full 36-journey backlog treated as demo scope | Product owner uses stage/coverage register and explicit change control |
| Catalog refresh/correction work exceeds capacity | Measure staff effort and source lag at pilot; narrow sources/workloads before expansion |
| Commercial incentives erode trust | Separate sponsorship and organic suitability with reviewable controls |
| Solo or inexperienced native team delays delivery | Re-estimate after G1; effort figures are assumptions, not a launch date |

## 14. Governance and open decisions

The live spreadsheet's priority is a sequencing signal. Its unfilled “Chốt làm” column is not approval. A change request records the business reason, affected IDs, stage, data/native dependencies, effort/cost impact, test changes and decision owner. Demo approval does not automatically approve every expansion feature.

Before G1: name sponsor/technical owner, identify test devices and native toolchains. Before D1: select provider/access budget and data-handling settings. At G3: accept demo findings and production scope or require revision. Before G4: decide source agreements, supported variants/workloads/OS versions, freshness windows, retention, support ownership, RPO/RTO and quantified pilot targets. Monetization model, expansion order and partner services remain separate business decisions.

## 15. Sources and document precedence

- **S1:** [Live feature backlog, gid 0](https://docs.google.com/spreadsheets/d/12dppW4eD3ej3eNVrsff2c4afLkCRoGLh4WWpfufvVGA/edit?gid=0), read 11 November 2026. Tab title at read: “Liệt kê tính năng”; STT 1–36. Other tabs were not changed or treated as approved scope.
- **S2:** [Project scope](../../research/project-scope.md), [demo plan](../../research/demo-implementation-plan.md), [technical blueprint](../../research/technical-blueprint.md), [mobile UX](../../research/mobile-interface-strategy.md), [onboarding research](../../research/onboarding-questionnaire-research.md) and [question bank](../../research/onboarding-question-bank.json).
- **S3:** [Microsoft RNW architecture](https://microsoft.github.io/react-native-windows/docs/new-architecture/) and [Android Material 3/Expressive](https://developer.android.com/develop/ui/compose/designsystems/material3), checked 11 November 2026. They establish platform mechanisms, not completion of this project's integration.
- **S4:** [PhoneArena database licensing](https://www.phonearena.com/database), checked 11 November 2026. No license or retailer integration has been acquired.

Explicit user decisions take precedence. This BRD and companion implementation plan reconcile the latest scope for review; older research remains evidence/context rather than a separately committed backlog. If the live backlog changes, update stable-ID traceability and review material scope differences instead of silently replacing an approved baseline.

## 16. Detailed core user use cases

Acceptance IDs are stable and map to planned verification in the register. “Given/when/then” criteria describe required behavior, not tests already passed. Unless stated otherwise, demo cases use synthetic fixtures; production cases require published real records. Read each use case together with BR-01–16.

### 16.1 U01 — Receive a suitable shortlist

Actor: buyer or someone choosing for a recipient. Entry: Discover → Find a suitable laptop. Precondition: the chosen category is supported in the active dataset. Inputs: purchase scope, exact total ceiling or explicit unknown, tasks, relevant applications/scale, condition and priorities. Output: a confirmed profile and a versioned result, clarification or no-fit explanation.

Flow: choose the guided route; answer the necessary core questions; receive task-specific follow-ups; review tasks, hard constraints, preferences and unknowns; confirm; inspect a shortlist. Changing a task invalidates its dependent answers and derived recommendations. An exploratory preview with unresolved requirements is visually qualified and cannot be described as confirmed suitable.

- **AC-U01-01:** Given a coding task and a VM follow-up, when the task is removed, then dependent VM assumptions stop affecting the next confirmed run and the change is visible in review.
- **AC-U01-02:** Given an unknown ceiling or essential application requirement, when options are requested, then the system clarifies or labels an exploratory result; it does not assume unlimited funds or confirmed compatibility.
- **AC-U01-03:** Given no configuration passes all hard constraints, when the run completes, then the result identifies the decisive unmet requirements and offers voluntary edits without changing the stored constraints.
- **AC-U01-04:** Given a confirmed profile revision and a later edit, when an older run finishes, then it cannot replace the newer revision's result. Back and retry preserve the user's explicit answers.

### 16.2 U02 — Find an offer without completing setup

Actor: buyer who already knows some preferences or a model name. Entry: Discover → Find deals/search. Precondition: a supported catalog is available. Flow: enter a name or filters, inspect matching cards, change sort/filter, then open detail, save or select comparison. Search and filters operate on exact variants; a family result exposes the configuration choice before presenting an exact buying claim.

- **AC-U02-01:** Given no questionnaire profile, when a buyer searches a supported name, then usable catalog results appear without signup or unrelated questions.
- **AC-U02-02:** Given a filter/sort change during loading, when results return, then the visible set corresponds to the latest criteria and selected items are not silently replaced.
- **AC-U02-03:** Given a current offer without historical selling-price evidence, when its card renders, then it shows the observed price and conditions without an unsupported percentage-discount or urgency claim.
- **AC-U02-04:** Given zero matches or unavailable sources, when search finishes, then the screen distinguishes no matches, unavailable current offers and network failure, retaining the query and available cached context.

### 16.3 U03 — Inspect a configuration and its evidence

Actor: buyer. Entry: select a device from results, comparison or saved items. Flow: inspect exact identity and key facts, expand task relevance/specifications/evidence, change configuration, report a discrepancy if necessary. A manufacturer claim, measurement and owner report must not be presented as the same evidence type.

- **AC-U03-01:** Given similar family names with different RAM/display specifications, when the selected variant changes, then price, offers, advantages and disadvantages all refer to that variant; facts from the previous variant are not retained as current.
- **AC-U03-02:** Given a decisive numeric claim, when the buyer opens its evidence, then the source, date, exact tested configuration, units and relevant measurement context are available, or the claim is marked unsupported and withheld from verified advice.
- **AC-U03-03:** Given no profile or incomplete evidence, when detail renders, then general information and unknowns remain readable without a personalized suitability assertion that cannot be evaluated.
- **AC-U03-04:** In P, given a visible record, when the buyer submits an information error, then the report references that record/revision and is acknowledged without granting access to other users' reports. Demo review findings may be recorded locally instead.

### 16.4 U04 — Compare alternatives on a consistent basis

Actor: buyer. Entry: select comparison on two exact variants. Flow: inspect task-relevant differences, expand equal/secondary specifications, change requirements or replace one variant, then choose, save or return to results. Mobile defaults to a readable paired view; Windows may expose a wider comparison without changing the calculation rules.

- **AC-U04-01:** Given two variants with comparable values, when comparison opens, then units, purchase scope, price completeness and known/unknown evidence are consistent and visible; unsupported measurements are not converted into an invented winner.
- **AC-U04-02:** Given a mandatory requirement failure, when a soft priority changes, then the failed option remains ineligible for a confirmed recommendation and the cause stays visible.
- **AC-U04-03:** Given an item is removed or replaced, when the buyer navigates back and returns, then the remaining explicit selection and profile are preserved.
- **AC-U04-04:** Given a budget increase, when asked what improves, then the explanation names evidenced changes and relevant limits; it does not encourage spending to the ceiling or invent an improvement from missing data.

### 16.5 U05 — Choose a seller with an understood total

Actor: buyer. Entry: selected variant → Buying options. Inputs: delivery context and optional explicit eligibility where they affect the total. Flow: inspect sellers, expand charge/discount/policy details, compare the same scope and choose a destination. Output: a sample summary in D0 or a verified retailer handoff in P.

- **AC-U05-01:** Given known mandatory charges and an eligible immediate discount, when the total is displayed, then the arithmetic is reproducible from the charge breakdown and includes each charge once.
- **AC-U05-02:** Given unknown shipping or unconfirmed coupon eligibility, when offers are compared, then the unknown/conditional amount is separate; the offer cannot win a verified-lowest-total badge on an assumed charge or saving.
- **AC-U05-03:** Given an expired offer or suspended seller destination, when the buyer attempts the buying action, then the system blocks that current-offer claim and provides refreshed options or a clear unavailable state.
- **AC-U05-04:** Given demo mode, when the action is selected, then only a sample summary opens. In P, the approved exact destination opens and records a handoff event rather than a completed order.

### 16.6 U06 — Evaluate a quotation already found

Actor: buyer. Entry: Check an offer. Precondition: production-supported intake or manual entry, not the D0 path. Flow: enter link/text fields, inspect parsed facts and unknowns, confirm exact configuration and price conditions, supply relevant needs, then inspect suitability, questions for the seller and alternatives. Unsupported input retains a manual route.

- **AC-U06-01:** Given an unsupported link or failed parse, when intake completes, then it explains the limitation and offers editable manual fields without claiming that the seller or model was verified.
- **AC-U06-02:** Given extracted model, configuration or charges, when assessment is requested, then the user has an opportunity to confirm/correct them; ambiguous family identity remains unresolved until verified.
- **AC-U06-03:** Given a confirmed quote with missing mandatory fees or workload evidence, when assessment renders, then those gaps remain visible and the quote is not declared definitively cheaper or suitable.
- **AC-U06-04:** Given assessment results, when the buyer saves, compares or visits a seller, then the confirmed quotation revision and its provenance stay attached to the decision.

### 16.7 U07 — Preserve and share the reasoning

Actor: buyer. Entry: Save on an option or decision. Flow: name/save a decision locally, reopen it after navigation or restart, inspect changed/stale information, remove or share the selected brief. Persistence failure must not produce a false saved acknowledgement.

- **AC-U07-01:** Given a successful save, when the app restarts, then the confirmed profile, exact selected variants and dated offer context can be restored without depending on the AI provider.
- **AC-U07-02:** Given a changed or removed catalog record, when the decision reopens, then historical content is labelled and current availability is separate; the system never substitutes a different variant silently.
- **AC-U07-03:** In P, given a sharing request, when the brief is generated, then it contains the selected scope, reasons, limitations, source/time context and price uncertainty, excluding private free text unless explicitly included by the user.
- **AC-U07-04:** Given a delete request, when deletion succeeds, then the local decision no longer appears after restart. A storage error is actionable and does not destroy unrelated decisions.

### 16.8 U08 — Use the app with control over personal information

Actor: guest or future account holder. Entry: first launch or Settings & data. Flow: continue as guest, set available presentation preferences, inspect stored categories, export or delete within the current storage scope, and grant/reject optional permissions when a relevant feature is used.

- **AC-U08-01:** Given guest mode, when the user follows the core journey, then no account, notification permission or precise location is required.
- **AC-U08-02:** Given local-only decisions, when the user inspects storage and deletes them, then the interface accurately describes that local scope and does not claim deletion from a future server/account service.
- **AC-U08-03:** Given an optional permission is refused, when its related feature is used, then the app explains the consequence and preserves applicable manual or basic functionality.
- **AC-U08-04:** In P, given a valid export/delete request for server-held data, when processed through the supported ownership-verification route, then the user receives the actual outcome and retention limits; raw prompts and uploaded documents are not exposed to unrelated staff.

## 17. Detailed admin controls and publication requirements

### 17.1 Minimum operating roles

Suggested roles are scoped bundles, not a requirement to hire six people. Multiple roles may be held by one person, but their effective rights must be explicit. Automated imports can stage records but cannot invent a review decision.

| Operation | Editor | Reviewer | Recommendation maintainer | Support | Operations | Access administrator |
|---|---|---|---|---|---|---|
| Stage/edit catalog, offers and evidence | Yes | Yes | Read | Limited read | Operational metadata | No default content privilege |
| Publish/reject content revisions | No | Yes | Only assigned rules/model releases | No | Emergency suspension only | No by default |
| Change workload/prompt/ranking version | Draft if assigned | Evidence review | Draft/evaluate; release within assigned authority | No | Roll back approved version | No by default |
| Resolve customer report | Supply evidence | Approve content correction | Assess recommendation issue | Assign/respond/close with reason | Recover service | No by default |
| Inspect private support data | No default | No default | Redacted evaluation only | Minimum necessary for assigned request | Redacted diagnostics | Access configuration, not unrestricted content |
| Suspend source/service and inspect restore | No | Suspend affected content | Disable AI feature within scope | No | Yes, audited | No by default |
| Grant/revoke staff roles | No | No | No | No | No unless separately assigned | Yes, audited |

Production must define a reviewer for each release. Prefer a different reviewer for high-impact price, rule and model changes. If staffing prevents separation, identify that exception and require a recorded preview/evaluation/reason; do not represent a single actor's actions as independent review.

### 17.2 Admin acceptance cases

| Criterion | Given / action / required result |
|---|---|
| **AC-A01-01** | Given a staff role lacks publication authority, attempting to publish through UI or API is denied and logged without changing the published revision. |
| **AC-A01-02** | Given access is revoked, subsequent privileged calls/refresh attempts fail; role assignment and revocation identify actor, target, scope and time. |
| **AC-A02-01** | Given a mapped source file with valid and invalid rows, import stages a reviewable result with row errors; rejected data does not silently enter the public catalog. |
| **AC-A02-02** | Given the same import is retried, accepted record identity is preserved without duplicate variants/offers; changed inputs appear as a new staged revision. |
| **AC-A03-01** | Given two similar names with different part numbers/configurations, review keeps them distinct unless evidence supports merging; affected offers and saved references are considered. |
| **AC-A03-02** | Given a reviewed content revision, publication makes that revision retrievable; an attempted overwrite from an older editor revision returns a conflict, and restoration preserves history. |
| **AC-A04-01** | Given unmatched variant, unclear mandatory fees, stale evidence or disallowed destination, the reviewer cannot publish the corresponding verified-fit/lowest-total/active-buying claim until its prerequisites hold. |
| **AC-A04-02** | Given an offer or seller is suspended, current result/offer delivery excludes the affected buying claim and cached clients label their old observation when refreshed. |
| **AC-A05-01** | Given a numeric claim or benchmark, a reviewer can trace it to the tested configuration, method, date and permitted evidence; unresolvable claims are held back. |
| **AC-A05-02** | Given evidence is withdrawn or contradicted, affected claims are identified for re-review and unsupported current advice is withheld without destroying the historical record. |
| **AC-A06-01** | Given an updated question/rule set, simulation verifies reachability, valid exclusive options and required clarification before a version can be activated. |
| **AC-A06-02** | Given a new rule version becomes active, new runs record it; historical runs remain interpretable with their original version and are not silently rewritten. |
| **AC-A07-01** | Given a candidate model/prompt/rule release, the fixed evaluation report identifies regressions and mandatory failures; an unresolved critical failure blocks normal release. |
| **AC-A07-02** | Given rollback or AI disabling, new advice uses the selected safe version/fallback and exposes its mode; authoritative price and eligibility calculations remain available. |
| **AC-A08-01** | Given duplicate reports, support can relate them to the same record without leaking another reporter's personal information; a resolution identifies evidence and action/reason. |
| **AC-A08-02** | Given a validated correction, publication/suspension and report resolution are linked; notification only uses an available, appropriate user channel. |
| **AC-A09-01** | Given an import/model/source failure, operations can identify affected records/requests and apply bounded retry, suspension or fallback with an audit reason. |
| **AC-A09-02** | Given an intervention, recovery is checked against fresh observations and error state, not inferred from clicking retry; unresolved incidents retain owner and next action. |

### 17.3 Minimum criteria before expansion is scoped

These outcomes prevent future features being treated as simple switches. They do not authorize implementation now.

| Criterion | Parent requirements | Required business evidence before acceptance |
|---|---|---|
| **AC-EX-01** | U09, A12 | Same-variant observation history with coverage gaps, consented tracking, offer revalidation, deduplication/cooldown and usable stop controls |
| **AC-EX-02** | U10 | Documented payment terms and reproducible totals; saving/contribution assumptions editable; no credit-approval claim |
| **AC-EX-03** | U11 | Defined condition evidence, lock/repair unknowns, model-specific checks and honest new-versus-used cost basis |
| **AC-EX-04** | U12, A14 | Exact current device, diagnosed versus unverified limitation, permitted upgrade paths and sourced cost/compatibility |
| **AC-EX-05** | U13, A14 | Reviewed build, multi-part compatibility, critical unknown blocking and whole-basket costs/availability |
| **AC-EX-06** | U14 | User-confirmed purchase, source policy dates, corrected receipt fields and reminders that can be changed/stopped |
| **AC-EX-07** | U15 | Explicit workspace membership/roles, scoped sharing, concurrent revisions and attributable agreement/approval |
| **AC-EX-08** | U16 | Conditional versus final quote, documented inspection/fees, handover checklist and no certified-erasure assertion |
| **AC-EX-09** | U17, A16 | Moderation/review, owner evidence context, expert qualification/fees/conflicts and a path to dispute decisions |
| **AC-EX-10** | U18, A15 | Active service/program terms, coverage, eligibility/deposits/responsibility, verification dates and suspension process |
| **AC-EX-11** | A10, A11, A13 | Controlled release/revert, valid aggregate measurement, and an ownership-verified support/export/delete process where server data exists |
| **AC-EX-12** | A17, A18 | Sponsor labels/ranking independence and genuine partner reconciliation; category/country coverage and complete local buying tests before rollout |

## 18. Business state models and data quality policy

### 18.1 Decision and offer states are independent

Maintain separate answers to: Is the requirement understood? Is this configuration suitable? Is there a current offer? Is its complete total within the ceiling? A configuration can satisfy software needs while its offer has unknown shipping; that does not justify a verified-affordable label. An unsuitable device may be visible in an explicit comparison with its failure shown.

| Object | States and business transition |
|---|---|
| Needs profile | Draft → needs clarification or ready for review → confirmed revision; edits create a new draft/revision and stale derived results |
| Recommendation run | Requested → evaluating → results ready, needs clarification, no suitable configuration, no verified offer, or failed; completed results retain the inputs and versions |
| Variant fit | Pass, fail or unknown against mandatory constraints; preferences rank only eligible results and never erase a failed condition |
| Offer match | Unresolved, accepted or rejected; only accepted identity supports an exact purchasing comparison |
| Price basis | Complete comparable total, partial known subtotal or conditional scenario; each records scope/eligibility/location assumptions |
| Offer validity | Current, stale, expired, unavailable or suspended; observation age and explicit expiry/availability are tracked separately |
| Staff content | Draft → in review → published; rejection returns to draft; suspension removes current claims; archival ends active use; restoration is a new audited action |
| Customer report | New → triaged → assigned/in progress → awaiting evidence or resolved/rejected; reopening preserves prior decisions |

Saved decisions retain historical meaning when current data changes. A cached client cannot be guaranteed to learn of a suspension while offline; it must retain its observed-at context and refrain from asserting a newly verified offer. On reconnect, current publication/validity state is reconciled before a current-buying claim.

### 18.2 Price calculation example and policy

Illustrative arithmetic only: base VND 20,000,000 + mandatory delivery VND 200,000 + mandatory assembly VND 300,000 = VND 20,500,000. An immediate VND 500,000 discount reduces the total to VND 20,000,000 only if eligibility and stacking are confirmed. If shipping is unknown, show the known subtotal and unknown shipping; do not insert zero or compare the subtotal as a complete total. Optional insurance is shown separately until explicitly selected. A required cost already included in base price is not added again.

Freshness is source-specific. Before G4, the data owner proposes acceptable age/expiry rules based on actual access/update behavior and records the rule owner, fallback and recheck method. There is no blanket “live” promise. Expiry, source outage and stale observations have explicit UI and ranking treatment. Changing a freshness policy is versioned and evaluated against current catalog coverage.

### 18.3 Evidence conflicts and corrections

Prefer sources according to the assertion: manufacturer evidence for offered configuration/support, retailer terms for an offer, and appropriately documented tests for measured behavior. This is not an absolute rule that every manufacturer or seller claim overrides contradictory evidence. Store disagreement, identify which assertion cannot be resolved, and withhold the corresponding verified claim until reviewed.

Accepted corrections record old/new value, source, actor/reviewer, reason, time and affected variants/offers/rules. An import must not automatically overwrite a reviewed assertion with lower-confidence data. Large corrections or source withdrawal trigger impact assessment across current recommendations, offers and saved references. Product history and auditability do not require storing private customer prompts indefinitely.

## 19. AI authority, privacy and audit boundaries

The deterministic system owns confirmed constraints, monetary calculation, variant identity, offer eligibility and purchase destinations. AI owns a proposal or explanation only within an allowed set of fields/facts. A valid source ID is necessary but insufficient to prove that the attached sentence is true: claims must actually match the referenced evidence and calculation context.

The preferred demo explanation format is constrained claims selecting verified fact references and approved relation types, rendered with controlled wording. More open prose requires additional evaluation and claim checking before it is allowed to express numerical or compatibility conclusions. Unverifiable statements are removed or replaced by deterministic wording. A response that references real evidence but contradicts it still fails acceptance.

Private free-text needs can reveal workplace or personal information. Before transmission, show the applicable AI use notice and send only the fields needed for the request. Use invented prompts for scripted D1 review. Production provider settings, retention, diagnostic scope and deletion behavior are G4 decisions, not assumed properties of a vendor. Basic browsing remains independent of model consent and availability.

Demo storage is local and limited to decisions/preferences. Model credentials are server-held. Production separates public catalog data, internal operational records and personal decision/support data. Staff access is task-scoped; raw prompts/files do not become a broadly searchable admin resource. Export/share content uses explicit selection and preserves price/source caveats. Audit events identify privileged actions without copying unnecessary private content.

## 20. Measurement definitions and operating decisions

Define measurement before optimizing a dashboard. Use dataset/rule/model version, supported cohort, time window, sample size and missing observations when reporting each measure.

| Measure | Definition / denominator | Interpretation and decision |
|---|---|---|
| Mandatory-constraint violation rate | Incorrectly accepted items / evaluated items with independently adjudicated mandatory requirements | Release set must have no unresolved critical violation; unknown/unassessed cases reported separately |
| Needs capture error | Material incorrect/omitted confirmed fields / adjudicated relevant fields, with unknowns and user corrections tracked | Determines question/AI changes; do not count a guessed default as a correct answer |
| Complete-total discrepancy | Amount and cause of difference between the app's complete total and audit-time source/checkout under the same context | Fixtures require exact arithmetic; live changes distinguished from calculation/eligibility errors |
| Coverage | Supported test profiles with at least one verified eligible offer / all selected supported profiles | Report by workload/budget/source and no-fit cause; catalog record count alone is insufficient |
| Freshness coverage | Displayed active offers meeting their source-specific freshness rule / displayed active offers | Missing observations count explicitly; freshness rule and observation failures must be visible |
| Decision comprehension | Participants correctly explaining fit, price conditions, unknowns and next step / participants attempting the scenario | Exploratory feedback is qualitative at small sample sizes; use it to prioritize revisions |
| Useful-session cost | Attributable model, hosting/data and estimated operating effort / sessions meeting a defined useful-decision outcome | Define outcome before reporting; retailer clicks are not confirmed purchases |
| Correction turnaround | Time from actionable report to verified correction/resolution, with waiting states identified | Prioritize high-impact wrong-price/variant issues and measure staff workload |

Before G4, approve values and owners for catalog coverage target, supported budgets/workloads, source freshness windows, provider usage cap, support hours/escalation, personal-data retention, restore point/time objectives, and error/latency reporting. A field remaining TBD is an unresolved gate condition where required for safe operation; silently choosing a convenient default is not approval.

## 21. Severity, decision rights and release exceptions

- **S0 / stop:** exposed credentials/private data, unauthorized admin publication, or systemic integrity failure. Contain and suspend the affected capability; an emergency response is recorded.
- **S1 / release blocker:** a core journey cannot complete on a supported client, an incorrect exact-variant/affordability claim, a critical mandatory constraint passing incorrectly, or an unsupported AI buying assertion.
- **S2 / material issue:** important friction or partial degradation with a truthful, usable workaround and no integrity/access violation.
- **S3 / minor:** presentation or secondary-content defect without a misleading decision outcome.

No open S0/S1 issue is accepted as routine gate passage. A product scope change may remove the affected capability from the release only if it is explicit, the remaining journey stays coherent, and tests/copy are updated. S2 acceptance records owner, workaround, user impact, due date and rationale; it is never relabelled “passed.” Demo-only deferrals do not satisfy production requirements.

Sponsor owns scope/funding and gate decisions; technical lead owns integration/architecture evidence; data/recommendation reviewers own domain/evidence assessments; QA owns reproducibility and defect evidence; operations owns readiness/recovery evidence. Reviewers recommend, and the accountable decision owner records accept/revise/stop with date and required follow-up. A sole developer may hold several roles but should identify which assessments lack independent review.

## 22. Definition of requirements readiness and change impact

A requirement is ready for implementation when its actor, supported scope, trigger, confirmed inputs, outcome, exception behavior, business-rule references, data dependencies, acceptance IDs and accountable reviewer are identified. A requirement is ready for acceptance only when its actual evidence is attached and the relevant gate owner decides. Document completeness is not feature completion.

A scope change record includes: request and business need; affected U/A/BR/NFR and acceptance IDs; release stage and user/admin flow impact; source/privacy/native dependencies; delivery/operating cost estimate; migration or compatibility effects; verification changes; decision and owner/date. Re-run relevant regression and update the traceability register. Later-stage placeholders require a separate detailed readiness review before being promoted into current delivery.
