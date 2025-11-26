# Mars Realestates - Design Guidelines

## Brand Identity
**Company:** Mars Realestates  
**Primary Color:** `#f89722` (Mars Orange) - Use dominantly throughout
**Style:** Premium, modern, clean real estate aesthetic

## Color Strategy
- **Mars Orange (#f89722):** Main buttons, section titles, navbar accents, card highlights, CTAs
- **Background:** Dark/neutral tones (black/dark gray)
- **Cards:** White/light backgrounds with soft shadows
- **Text:** White on dark backgrounds, dark on light cards

## Layout System
**Spacing:** Use Tailwind's standard spacing scale with emphasis on generous padding
- Section padding: `py-16` to `py-24` 
- Card padding: `p-6` to `p-8`
- Container: `max-w-7xl mx-auto px-4`

**Border Radius:** `rounded-xl` and `rounded-2xl` for modern, soft appearance

## Typography
- **RTL Support:** All public pages use Arabic with RTL layout (`dir="rtl"`)
- **Hierarchy:** Clear size differentiation between headings, body, and captions
- Use bold weights for Arabic headings to maintain readability

## Component Patterns

### Navigation Bar
**Behavior:**
- **Home page top:** Transparent background (`bg-transparent`), white text, Mars orange on hover
- **On scroll:** Transition to `bg-black/70` with `backdrop-blur`, maintain readability
- **Internal pages:** Solid dark/translucent background by default
- **Structure:** Logo left, four dropdown menu items, phone number and admin icon right (RTL)

### Cards (Projects & Units)
- White/light background on dark page background
- Soft shadows: `shadow-md` to `shadow-lg`
- Hover effects: `hover:scale-105 hover:shadow-xl` transitions
- Mars orange accent on borders or buttons
- Display: Image top, content below with clear hierarchy

### Buttons
**Primary (Mars Orange):**
- Background: `#f89722`
- Text: White
- Hover: Slightly darker or elevated shadow
- Rounded: `rounded-lg` or `rounded-xl`

**Secondary:**
- Outlined with Mars orange border
- Transparent/white background
- Mars orange text

**On Images:** Blurred background (`backdrop-blur-md bg-white/20` or `bg-black/40`), no additional hover background changes

### Forms
- Clean, spacious input fields
- Labels in Arabic with clear hierarchy
- Mars orange focus states
- Success messages in Arabic with Mars orange accent
- Generous padding and clear field separation

## Animations (Framer Motion)
- **Hero section:** Fade-in and slide-up for text and buttons
- **Scroll animations:** Fade/slide for about section and cards
- **Transitions:** Smooth, subtle, professional
- **Hover states:** Scale transforms (1.02-1.05) with shadow elevation
- **Image transitions:** Smooth fade when changing gallery images

## Page-Specific Layouts

### Home Page
1. **Hero:** Full-width background image/gradient, centered logo/heading, two CTAs, animated entrance
2. **Featured Units Grid:** 3-4 columns on desktop, filter bar above, Mars orange card accents
3. **About:** Two-column layout (text + image), scroll-triggered animation
4. **Categories:** Four cards with icons, Mars orange heavily featured
5. **Contact Form:** Clean form layout with Mars orange submit button
6. **Footer:** RTL layout, company info, Mars orange accents

### Project Page
- Hero-style header with Mars orange accent strip
- Project logo and details prominently displayed
- Amenities as bullet list or icon grid
- Lead form in dedicated section
- Units grid below with filter bar pre-configured

### Unit Detail Page
- Large image gallery: main image + clickable thumbnails below
- Two-column layout: Images left, details right (or stacked on mobile)
- Clear information hierarchy: title, price (large), specs (area, bedrooms, bathrooms)
- Mars orange CTAs and accents
- Similar units carousel at bottom

### Admin Dashboard
- **Sidebar:** Dark background, Mars orange active states, clear iconography
- **Top bar:** White/light background, username and logout
- **Content area:** Light background, data tables with clear headers
- **Cards:** Statistics with Mars orange icons/numbers
- **Forms:** Clean CRUD interfaces matching public site style

## Images
**Hero Section:** Large, high-quality real estate imagery (modern buildings, luxury interiors)  
**Unit Cards:** Property photos showcasing best features  
**Project Pages:** Project logos, development renders, amenities illustrations  
**Unit Galleries:** Multiple angles of properties, professional photography  
**About Section:** Team photo or company illustration representing Mars Realestates

## Filter System
- Horizontal bar above unit grids
- Dropdowns and inputs styled consistently
- Mars orange apply button
- Clear/reset as secondary button
- Result count display in Mars orange
- **Ensure all select options have non-empty values**

## Accessibility & Quality
- Maintain RTL consistency throughout Arabic pages
- Sufficient color contrast on Mars orange backgrounds
- Clear focus states for keyboard navigation
- Responsive breakpoints: mobile-first, tablet, desktop
- Loading states for async operations
- Error messages in Arabic with clear styling