# Accessibility Issues

This is a task list of accessibility issues identified on the Starlight Tech Radar in light mode.

## Critical Issues

- [x] **Missing Button Names (`button-name`)**
  - **Issue:** Several buttons do not have discernible text or `aria-label` attributes.
  - **Locations:** Header toolbar button, header item label button, and footer toolbar button.
- [x] **Invalid ARIA Children (`aria-required-children`)**
  - **Issue:** An element with `role="list"` contains child elements (`<hr>`, `<button>`) that are not permitted as direct children.
  - **Location:** The main `.q-list` in the sidebar.
- [x] **Missing Image Alt Text (`image-alt`)**
  - **Issue:** An `<img>` element is missing an `alt` attribute.
  - **Location:** The Starlight logo image (`<img src="/icons/starlight-logo.png">`).

## Serious Issues

- [ ] **Insufficient Color Contrast (`color-contrast`)**
  - **Issue:** Several elements do not meet the WCAG 2 AA minimum color contrast ratio of 4.5:1.
  - **Locations:**
    - "Homepage" sidebar link (Contrast: 2.11)
    - "MIT" chips on radar cards (Contrast: 3.07)
    - "Guidance" buttons on radar cards (Contrast: 3.07)
    - "New" status chip (Contrast: 1.92)
    - "Ele" link in the footer (Contrast: 2.33)

## Moderate Issues

- [x] **Zooming Disabled (`meta-viewport`)**
  - **Issue:** The `<meta name="viewport">` tag contains `user-scalable=no`, which disables text scaling and zooming on mobile devices.
- [ ] **Missing H1 Heading (`page-has-heading-one`)**
  - **Issue:** The page does not contain a level-one heading (`<h1>`).

## Minor Issues

- [x] **Invalid ARIA Role (`aria-allowed-role`)**
  - **Issue:** The `listitem` role is not allowed on the `<a>` (link) elements in the navigation sidebar.
  - **Locations:** "Homepage" and "Settings" navigation links.
