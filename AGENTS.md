# naimbro.github.io

Academic personal website for **Naim Bro**, Assistant Professor at the School of Government, Universidad Adolfo Ib&aacute;&ntilde;ez (UAI), Santiago, Chile. Hosted on GitHub Pages.

## Tech stack

- Plain HTML / CSS / vanilla JS. No framework, no build step, no package manager.
- Deploy by pushing to `main` (GitHub Pages serves from this branch).

## Directory map

| Path | Description |
|------|-------------|
| `index.html` | Landing page (English) &mdash; bio, publications, teaching list, public writing |
| `teaching/` | Course syllabi (Spanish), one HTML file per course, organized by year |
| `teaching/MEPP/` | Master's program (MEPP) syllabi (Spanish) |
| `ai-interview/` | Standalone AI interview assistant app (modular vanilla JS + OpenAI API, has its own `js/`, `css/`, `config/`, `assets/`) |
| `panel_debate/` | Interactive debate panel app |
| `duoc/` | Bookdown-generated report &mdash; **auto-generated, do not hand-edit** |
| `data/` | Research datasets (CSV) linked from publications |
| `programa_MEPP_UAI/` | Additional MEPP program materials |
| Root `.html` files | Various visualizations, drafts, and one-off pages |

## Language conventions

- Landing page (`index.html`): English.
- Teaching syllabi and public writing references: Spanish.
- Code comments and documentation: English.

## Content patterns

- Pages use inline `<style>` blocks (no shared stylesheet).
- External dependencies loaded via CDN (Font Awesome 4.7, Google Fonts).
- Internal links use relative paths; external links use `target="_blank"`.
- Publications list is an `<ol>` in `index.html` with each `<li>` containing a link, journal name in `<i>`, year, and optional data links.
- Teaching list is an `<ol>` in `index.html` with each `<li>` containing a course name, syllabus link, institution in `<i>`, and year.

## Teaching syllabi

### Active courses (2026)

| File | Course |
|------|--------|
| `teaching/2026_AI_democracy.html` | AI and Democracy (Minor in AI, UAI) |
| `teaching/2026_temas_emergentes.html` | Emerging Topics: AI and Democracy &mdash; intensive 3-class version (Minor in AI, UAI) |
| `teaching/2026_programa_ai_research.html` | AI in Research (PhD, UAI) |
| `teaching/2026_descripcion_visualizacion_datos.html` | Data Description and Visualization (Sociology-Business Engineering double degree, UAI) |
| `teaching/MEPP/2026_programa_ML_II.html` | Machine Learning II (MEPP, UAI) |

### Naming convention

New syllabi must use the format: **`YEAR_coursename.html`** (e.g. `2027_network_science.html`). Older files use a `programa_NAME_YEAR.html` convention; don't rename them.

### Important: file renames require index.html updates

Whenever a syllabus file is renamed or moved, check `index.html` for links pointing to the old path (search for the old filename) and update them. The teaching list starts at `<!-- Teaching-->` (around line 103).

## Common tasks

### Add a publication to the homepage

1. Open `index.html`.
2. Find the `<!-- Publications -->` section (around line 62).
3. Add a new `<li>` **at the top** of the `<ol>` (newest first). Follow this template:

```html
    <li><a href="PAPER_URL" target = '_blank'>Paper Title</a><br>
    <i>Journal Name</i> YEAR.<br>
```

If there are supplementary data links, add them after the journal line:

```html
    <a href='DATA_URL' target = '_blank'>Data</a>
```

### Create a new course syllabus

1. Create a new HTML file in `teaching/` (or `teaching/MEPP/` for MEPP courses).
2. Name it `YEAR_coursename.html` (e.g. `2027_network_science.html`).
3. Use an existing 2026 syllabus as a template &mdash; they use inline styles, no shared CSS.
4. Add the file to the "Active courses" table in this AGENTS.md.
5. Add a `<li>` entry to the Teaching section in `index.html` (newest courses first):

```html
    <li>Course Name (<a href = 'teaching/FILENAME.html' target = '_blank'>syllabus</a>)<br>
<i>Department, University</i>, YEAR
```

### Update professional info

Edit the header block in `index.html` (lines 51-60). This contains: name, title, affiliations, degree, current project, research areas, and contact links.

### Create Google Slides

Uses a GCP service account (`drive_credentials.json`) + Google Slides API. Presentations are auto-shared with `naim.bro@gmail.com`.

**Quick creation:**
```bash
python3 create_slides.py "Presentation Title"
```

**Slide template** (`slide_template.py`): Reusable template class for all courses. Always use this for consistent styling.

```python
from slide_template import SlideTemplate
t = SlideTemplate(presentation_id)
t.format_title_slide(slide_id, "Title", "Subtitle")
t.format_content_slide(slide_id, "Title", ["Bullet 1", "Bullet 2", "Bullet 3"], source="...")
t.format_closing_slide(slide_id, "Message", "email")
t.clear_slide(slide_id)       # remove all elements from one slide
t.clear_all_slides()          # remove all elements from all slides
t.add_blank_slide(obj_id, index)
t.delete_slide(slide_id)
```

**Template style** (minimalist, UAI-branded):
- Off-white background (`#F9F7F4`), dark gray text (`#2C2C2C`)
- Muted rose accent (`#C4878C`) from GobLab branding for lines and key-phrase highlights
- Font: Libre Franklin throughout
- Max 3 bullet points per content slide; key phrase before colon bolded in rose
- UAI Escuela de Gobierno logo on every slide (small bottom-right on content, centered on title/closing)
- Logo hosted on service account Drive (URL in `slide_template.py`)

**Gitignored files:** `drive_credentials.json`, `create_slides*.py`, `slide_template.py`, `logo-escuela-gobierno-uai.png`

## Things to avoid

- **Do not hand-edit files in `duoc/`** &mdash; they are auto-generated by Bookdown.
- **Do not introduce build tools or frameworks** (webpack, React, etc.) unless explicitly requested.
- **Do not add a shared CSS file** unless explicitly requested &mdash; the site uses inline styles by convention.
