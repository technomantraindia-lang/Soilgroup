# Soilgroup Website - React + Vite

A modern, responsive React website for Soil+ Organics - Making Organic Farming Simple.

## 📁 Project Structure

```
soilgroup-website/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── logo.png          ⬅️ ADD YOUR LOGO HERE
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── CategoryTags.jsx
│   │   ├── WhatLookingFor.jsx
│   │   ├── ProductCategories.jsx
│   │   ├── AdvancingFarming.jsx
│   │   ├── BuiltForGrowers.jsx
│   │   ├── ReadyToGrow.jsx
│   │   ├── ContactSection.jsx
│   │   └── Footer.jsx
│   ├── styles/               ⬅️ SEPARATE CSS FILES
│   │   ├── global.css
│   │   ├── TopBar.css
│   │   ├── Header.css
│   │   ├── Hero.css
│   │   ├── CategoryTags.css
│   │   ├── WhatLookingFor.css
│   │   ├── ProductCategories.css
│   │   ├── AdvancingFarming.css
│   │   ├── BuiltForGrowers.css
│   │   ├── ReadyToGrow.css
│   │   ├── ContactSection.css
│   │   └── Footer.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the project directory**
   ```bash
   cd soilgroup-website
   ```

2. **Add your logo**
   - Copy your `logo.png` file to `src/assets/logo.png`

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📝 CSS File Structure

Each component has its own CSS file for easy maintenance:

| Component | CSS File |
|-----------|----------|
| TopBar | `src/styles/TopBar.css` |
| Header | `src/styles/Header.css` |
| Hero | `src/styles/Hero.css` |
| CategoryTags | `src/styles/CategoryTags.css` |
| WhatLookingFor | `src/styles/WhatLookingFor.css` |
| ProductCategories | `src/styles/ProductCategories.css` |
| AdvancingFarming | `src/styles/AdvancingFarming.css` |
| BuiltForGrowers | `src/styles/BuiltForGrowers.css` |
| ReadyToGrow | `src/styles/ReadyToGrow.css` |
| ContactSection | `src/styles/ContactSection.css` |
| Footer | `src/styles/Footer.css` |
| Global Styles | `src/styles/global.css` |

## 🎨 Customization

### Colors
Primary colors used throughout:
- Primary Green: `#1B5E20`
- Dark Green: `#0D3B0F`
- Light Green: `#4ADE80`
- Yellow Accent: `#FBBF24`

### Fonts
- **Poppins** - For headings and display text
- **Inter** - For body text

## 🖼️ Adding Images

1. **Logo**: Place your logo in `src/assets/logo.png`
2. **Product Images**: Add to `src/assets/` and import in components
3. **Background Images**: Currently using Unsplash URLs, replace with local images

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

---

Made with 💚 for organic farming
