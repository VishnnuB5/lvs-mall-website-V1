# LVS Mall website

Static website for LVS Mall, New Airport Road, Chikkajala, Bengaluru 562157.
Plain HTML, CSS and a small JavaScript file. No build step, no frameworks.

## Pages
| File | Page |
|---|---|
| `index.html` | Homepage: hero, shop by category, key numbers, amenities, brands, interactive mall map, getting here, FAQ |
| `business.html` | LVS Mall for Business: about the mall, advertise, collaborate, retail leasing, partnership, enquiry form |
| `contact.html` | Contact us: address, hours, contact form, map link |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms & Conditions |

`js/lvs.js` runs the interactive parts of the homepage (brand filters, map search, floors, zoom, store cards, FAQ).
`assets/logos/` holds the brand logos; `assets/images/` holds the LVS logo, photos and icons.

## Publish on GitHub Pages (for testing)
1. Create a new repository on GitHub (for example `lvs-mall-website`).
2. Upload **everything inside this folder** (not the folder itself) to the repository: Add file > Upload files, drag all files and folders in, then Commit.
3. Go to **Settings > Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, Branch to **main** and folder to **/ (root)**, then Save.
4. After a minute or two the site is live at `https://<your-github-username>.github.io/lvs-mall-website/`.

To use your own domain later (for example `lvsmall.in`), add it under Settings > Pages > Custom domain and follow GitHub's DNS instructions.

## Forms
All forms (contact, business enquiry, newsletter) send to lvsmall@myyahoo.com through FormSubmit (formsubmit.co).
The very first submission triggers a confirmation email from FormSubmit; click the link once to activate the forms.
