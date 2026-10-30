# Open source built in (or for) Tamil Nadu — research for the `#oss` section

Checked on 30 Oct 2026. Every URL below returned HTTP 200 on that date (checked with curl; GitHub / GitLab facts pulled from their APIs).
No star counts, contributor counts or download numbers are used on the page on purpose: they go stale and we don't want to invent anything.

"Beginner-friendly" below means there is a written contributing guide, a "ways to contribute" list, or a list of open problems a newcomer can pick up. **None of the GitHub repos checked had an open issue labelled `good first issue` on 30 Oct 2026** (GitHub search API, total_count = 0), so the page tells students to look for that label *or* a docs fix *or* an open problem statement.

| # | Project | Category | TN connection | Stack | Licence | Link | Beginner? |
|---|---|---|---|---|---|---|---|
| 1 | SHAKTI | Hardware | RISE group, Dept. of CSE, IIT Madras, Chennai | Bluespec SystemVerilog (RISC-V cores) | BSD 3-clause | https://shakti.org.in/ · code https://gitlab.com/shaktiproject | Go deeper (docs exist, not beginner) |
| 2 | IndicTrans2 | AI/ML | AI4Bharat, a research lab at IIT Madras | Python | MIT | https://github.com/AI4Bharat/IndicTrans2 | Go deeper |
| 3 | Indic-TTS | AI/ML | AI4Bharat, IIT Madras; Tamil is one of 13 languages | Python / Jupyter (FastPitch + HiFi-GAN, Coqui TTS) | MIT | https://github.com/AI4Bharat/Indic-TTS | Go deeper |
| 4 | Open-Tamil | Tamil computing | Built for Tamil computing by the Ezhil Language Foundation community | Python (+ JS web tools) | MIT | https://github.com/Ezhil-Language-Foundation/open-tamil | Yes: CONTRIBUTING.txt, tests |
| 5 | Ezhil | Apps & tools | A Tamil programming language for first-time coders (K-12) | Python (interpreter) | GPL-3.0 | https://github.com/Ezhil-Language-Foundation/Ezhil-Lang | Yes: CONTRIBUTING.txt, docs |
| 6 | FreeTamilEbooks (+ `create_ebooks`) | Tamil computing | Kaniyam Foundation (கணியம் அறக்கட்டளை), registered in Chennai (West Tambaram), est. 1 Jan 2012 | Python + LibreOffice scripts for the ebook pipeline; site is WordPress | Books: Creative Commons (site text CC BY-SA 4.0; each book states its own); scripts: no SPDX licence detected | https://freetamilebooks.com/ · https://github.com/KaniyamFoundation/create_ebooks | Yes: volunteer + "publish your work" pages; non-code help welcome |
| 7 | eKalappai | Tamil computing | ThamiZha (தமிழா) team; Tamil99 layout recommended by the TN government | C++ (scim-table keymaps) | GPL v3 (stated in source headers) | https://github.com/thamizha/ekalappai | Archive: last code push 2015; layouts live on in Keyman (https://keyman.com/keyboards/h/tamil/) |
| 8 | Catamaran | Design/Fonts | A Tamil + Latin type family by Pria Ravichandran; the Tamil font used on this very page | Font sources | SIL OFL 1.1 | https://github.com/VanillaandCream/Catamaran-Tamil · https://fonts.google.com/specimen/Catamaran | Go deeper (type design) |
| 9 | Namma Wallet | Apps & tools | Namma Flutter, the Flutter Chennai community. Parses TNSTC and SETC bus tickets, IRCTC QR | Dart / Flutter | MIT | https://github.com/Namma-Flutter/namma_wallet | Yes: README has Getting Started + Contributing |
| 10 | TOSSHack problem statements | Community | TOSSConf (Tamil open-source conference), Kaniyam Foundation + Tamil open-source community; TOSSConf26 was 23–25 Jul 2026 at St. Joseph's Institute of Technology, Chennai | Varied (issues list) | n/a | https://github.com/tossconf/TossHack26-ProblemStatements · https://tossconf26.kaniyam.com/ | Yes: open problems as GitHub issues (Tamil OCR, Tamil99 typing tutor, Kubernetes docs in Tamil, accessibility...) |
| 11 | ILUGC | Community | Indian Linux Users' Group, Chennai, since Jan 1998; monthly meets (recent ones at IIT Madras) | Hugo site (Go templates, Markdown); `register-ilugc` in Go (BSD-2-Clause) | site: none stated | https://ilugc.in/ · https://github.com/ilugc/ilugc.in | Yes: README lists ways to contribute (write/restore articles, theme) with fork → PR steps |
| 12 | FSFTN | Community | Free Software Foundation Tamil Nadu, registered under the TN Societies Registration Act; GLUGs in Viluppuram, Puducherry, Salem, Karaikudi, Trichy | Community (workshops, camps, GLUGs) | n/a | https://fsftn.org/ | Yes: join a college/regional GLUG |

## Dropped (could not verify well enough)

- **ThamiZha website (thamizha.org)**: domain is now parked ("may be for sale"). Kept eKalappai via its GitHub repo only.
- **Kaniyam `iyal-tamil-spellchecker`**: repo has no description, licence or contributor guide; too thin to recommend.
- **Freshworks Crayons** (`freshworks-oss/crayons`): real and active, but the Chennai link is the company's origin rather than the project; no licence detected by GitHub. Left out to keep the list clearly TN-rooted.
- **tossconf.com**: did not resolve. The live TOSSConf26 site is tossconf26.kaniyam.com.
- **TOSSConf tools** (`tossconf_pass_generator` GPL-3.0, `toss_pass_scanner` MIT): real but tiny and event-specific; the problem-statements repo is the better entry point for students.

## Sources

- SHAKTI: https://shakti.org.in/ ("3 part BSD license", RISE group, IIT Madras), GitLab API `gitlab.com/api/v4/groups/shaktiproject/projects` (active, last activity Oct 2026)
- AI4Bharat: https://ai4bharat.iitm.ac.in/ (research lab at IIT Madras), GitHub API for IndicTrans2 and Indic-TTS (MIT)
- Indic-TTS README: https://github.com/AI4Bharat/Indic-TTS (13 languages incl. Tamil; ICASSP 2023 paper)
- Open-Tamil README + CONTRIBUTING.txt: https://github.com/Ezhil-Language-Foundation/open-tamil
- Ezhil README + CONTRIBUTING.txt: https://github.com/Ezhil-Language-Foundation/Ezhil-Lang
- Kaniyam Foundation about page: https://kaniyam.com/about/
- FreeTamilEbooks: https://freetamilebooks.com/ ; create_ebooks README: https://github.com/KaniyamFoundation/create_ebooks
- eKalappai: https://github.com/thamizha/ekalappai ; Keyman Tamil layouts: https://keyman.com/keyboards/h/tamil/
- Catamaran: https://fonts.google.com/specimen/Catamaran , https://github.com/VanillaandCream/Catamaran-Tamil (OFL-1.1), https://fonts.adobe.com/designers/pria-ravichandran
- Namma Wallet README: https://github.com/Namma-Flutter/namma_wallet ; org: https://github.com/Namma-Flutter ("our Flutter Chennai community")
- TOSSConf26: https://ilugc.in/posts/tossconf-2026/ , https://tossconf26.kaniyam.com/ , https://dev.to/abishek_m_82/tossconf-1p4i , https://github.com/tossconf/TossHack26-ProblemStatements (issues list)
- ILUGC: https://ilugc.in/ , README https://github.com/ilugc/ilugc.in , https://github.com/ilugc/register-ilugc
- FSFTN: https://fsftn.org/ , https://blog.fsftn.org/
