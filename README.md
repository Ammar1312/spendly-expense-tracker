# Spendly - Expense Tracker / Finance Manager

Spendly is a responsive personal finance dashboard built with HTML, CSS, Vanilla JavaScript, Chart.js, and LocalStorage.

Users can manage transactions, review income and expenses, control budgets, import/export data, and keep everything stored locally in the browser.

## Live Demo

[View live project](https://ammar1312.github.io/CRUD-projects/)

## Overview

This project focuses on the workflows a small finance manager needs: form validation, persistent state, charts, filtering, sorting, custom confirmations, CSV import/export, JSON backup/restore, dark/light mode, and responsive navigation.

The app is intentionally frontend-only. There is no backend layer; data is stored in LocalStorage and can be backed up manually as JSON.

## Core Features

- Add, edit, delete, and view transactions
- Save transactions in LocalStorage
- Track total balance, income, and expenses
- View monthly KPI cards with mini visual indicators
- Analyze daily income/expense flow with Chart.js
- Switch to category and annual chart views
- Search transactions by description, category, amount, type, or date
- Filter by transaction type and category
- Sort by newest, oldest, amount, category, or type
- Set a monthly budget goal
- Set category budget limits with over-budget indicators
- Use demo data for a quick preview
- Import and export CSV files
- Export and restore full JSON backups
- Keep file and reset actions grouped inside an Advanced Tools menu
- Toggle dark and light mode
- Use a scroll-aware sidebar on desktop
- Use bottom navigation on mobile
- See empty states, validation messages, toast notifications, and custom confirmation modals

## Design Notes

Spendly uses a dashboard-style layout inspired by modern fintech interfaces, while keeping the visual design original.

- Desktop uses an ambient MP4 background for a more dynamic interface.
- Mobile disables the video background for better performance and battery life.
- Cards, charts, and controls use a compact finance-dashboard layout.
- Dark and light themes are supported.
- The UI is designed to stay practical and readable instead of becoming decoration-heavy.

## Data Model

Each transaction contains:

```json
{
  "id": "transaction-id",
  "type": "income",
  "amount": 1200,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2026-05-20",
  "createdAt": "2026-05-20T10:00:00.000Z",
  "updatedAt": null
}
```

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js
- LocalStorage
- SVG favicon
- Web app manifest

## Technical Highlights

- Organized DOM references and state management
- CRUD operations with persistent LocalStorage data
- Defensive form validation
- CSV parsing with quoted value support
- JSON backup and restore workflow
- Dynamic Chart.js rendering and chart cleanup
- Derived financial metrics from transaction state
- Date-based filtering for today, month, custom date, and all-time views
- Responsive CSS Grid and Flexbox layout
- Accessible form feedback, keyboard-friendly controls, and custom confirmation modal

## How To Run

Open `index.html` directly in the browser.

No build step, package manager, or backend is required.

## QA Checklist

Before presenting or deploying the project, test these workflows:

- Add a new income transaction
- Add a new expense transaction
- Edit an existing transaction
- Delete a transaction
- Clear all transactions
- Load demo data
- Search and filter transactions
- Sort transaction history
- Change the monthly budget goal
- Change category budget limits
- Switch between chart views
- Export and import CSV data
- Export and restore a JSON backup
- Toggle dark and light mode
- Refresh the browser and confirm LocalStorage persistence
- Check desktop, tablet, and mobile layouts
- On mobile, check the top action buttons, filter controls, charts, transaction rows, and bottom navigation

## Project Structure

```text
.
|-- index.html
|-- styles.css
|-- script.js
|-- favicon.svg
|-- manifest.webmanifest
|-- Scene.mp4
`-- README.md
```

## What This Project Demonstrates

- Building a complete app without a framework
- Structuring Vanilla JavaScript into clear functions
- Managing UI state and derived data
- Persisting data in the browser
- Working with files through import/export flows
- Rendering charts from application data
- Designing responsive dashboard interfaces
- Adding polish without sacrificing usability

## Future Improvements

- Recurring transactions
- Unit tests for utility functions
- Optional PWA install support with PNG app icons
- More advanced analytics, such as month-over-month comparisons
