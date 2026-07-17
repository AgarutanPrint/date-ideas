# A Letter to Tired Parents — Digital Companion

This is a free, standalone website version of your book: all 50 date
ideas browsable by category, plus the planning toolkit (planner, budget
tracker, conversation starters, and a page to add your own custom date
ideas) turned into real fillable tools. Everything a visitor fills in is
saved in **their own browser only** (via `localStorage`) — nothing is
sent to a server, and you won't see or collect their data.

## Files
- `index.html` — the page structure
- `style.css` — all styling
- `script.js` — navigation + interactivity
- `data.js` — all 50 date ideas (edit this file to change any content)

## Put it on GitHub Pages (free hosting)

1. Go to **github.com**, log in, and click the **+** in the top right →
   **New repository**.
2. Name it whatever you like, e.g. `tired-parents-dates`. Keep it
   **Public**. Don't add a README (you already have one). Click
   **Create repository**.
3. On the new repo page, click **uploading an existing file**.
4. Drag in all four files from this folder (`index.html`, `style.css`,
   `script.js`, `data.js`, `README.md`) and click **Commit changes**.
5. Go to the repo's **Settings** tab → **Pages** (left sidebar).
6. Under "Build and deployment," set **Source** to **Deploy from a
   branch**, branch **main**, folder **/ (root)**. Click **Save**.
7. Wait about a minute, then refresh — GitHub will show you the live
   URL, something like:
   `https://yourusername.github.io/tired-parents-dates/`

That's it — it's live and free, and you can share that link anywhere
(your Amazon book page, a QR code on the last page of the print book,
social media, etc).

## Making changes later
Everything text-based lives in `data.js` — open it in any text editor,
find the date you want to change, edit the wording between the quotes,
and re-upload that one file to GitHub (drag it into the repo page,
GitHub will ask if you want to replace it).

## If you'd rather not use GitHub at all
These same four files work by just double-clicking `index.html` on your
computer, or you can drop the folder into any basic web host (Netlify,
Vercel, even a Google Drive-based static host). GitHub Pages is just the
free, no-fuss option.
