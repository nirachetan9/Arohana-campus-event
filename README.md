# AROHANA — Kishkindha University

Static HTML/CSS/JS event registration website with Supabase storage and QR ticket generation.

## Files
- `index.html` — page structure
- `style.css` — responsive styling
- `app.js` — Supabase configuration, registration and QR ticket
- `supabase.sql` — database table and Row Level Security policy
- `netlify.toml` — Netlify publish configuration
- `assets/kishkindha-university-logo.jpg` — replace with the official university logo

## 1. Configure Supabase
1. Open your Supabase project.
2. Go to **SQL Editor** → **New query**.
3. Paste all contents of `supabase.sql` and click **Run**.
4. Open **Project Settings** → **API** and copy the **Project URL**.
5. Open **Project Settings** → **API Keys** and copy the **Publishable key**. A legacy `anon` public key also works.
6. Open `app.js`. Replace:
   - `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE`
   - `PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE`
7. Save `app.js`.

Never put a `service_role` key or secret key in browser code or a public GitHub repository.

## 2. Add university logo
The supplied Kishkindha University / AROHANA artwork is already included: `assets/kishkindha-university-brand.jpg` is the cropped crest + wordmark used in the header, and `assets/arohana-event-poster.jpg` is the full event poster used in the hero. Replace either asset only if the event team supplies updated artwork.

## 3. Test locally
Open the folder in VS Code. Use the Live Server extension and choose **Open with Live Server** on `index.html`. Test one registration with a valid KUB roll number. Confirm the row appears in Supabase → Table Editor → `arohana_registrations`.

Do not use the same roll number repeatedly: duplicate registrations are blocked.

## 4. Publish on Netlify
1. Sign in to Netlify.
2. Choose **Add new site** → **Deploy manually** (or drag and drop).
3. Upload the complete `arohana_website` folder, not just `index.html`.
4. Netlify will create a site URL ending in `netlify.app`.
5. Open that URL and test registration again.

Build command: leave blank.
Publish directory: `.`

## Important security and event operations
- The website validates the KUB prefix and the database prevents duplicate roll numbers.
- This public form does not verify that the person actually owns the submitted roll number. It is not student authentication.
- The QR code contains the ticket ID, name and roll number. Staff should compare the QR contents with the registration list at the entry desk.
- Student registrations are not publicly readable through the website. The event team can review them in Supabase Table Editor.
- Public anonymous forms can be abused. For a high-stakes ticketing launch, add server-side rate limiting / CAPTCHA and an authenticated staff check-in process.
- QR generation and Google Fonts/CDN scripts require an internet connection.
