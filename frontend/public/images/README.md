Drop real photos in this folder (e.g. about-team.jpg, home-hero.jpg).

Anything placed here is served at /images/<filename> — for example
frontend/public/images/about-team.jpg becomes reachable at
/images/about-team.jpg once the site is running.

To actually show one, open the relevant page file in src/pages/ and
replace the <PhotoPlaceholder ... /> line with:

  <img src="/images/about-team.jpg" alt="Our team on site" style={{ width: '100%', borderRadius: 10 }} />

This applies to the dashed "Add a photo" boxes on the Home and About
pages specifically. Portfolio projects and Inventory products don't need
this — those upload directly through the Admin Dashboard.
