# 🤝 Contributing to CampusCompass

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-blue)
![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)

First of all, thank you for checking out **CampusCompass**! 🚀

We're excited to have you join our open-source community. This project is designed to be beginner-friendly and provide a great learning experience for contributors participating in programs like **GSSoC**, **Hacktoberfest**, and other open-source initiatives.

This guide will help you get started quickly and contribute effectively.

---

# 🧭 Ways to Contribute

You can contribute in several ways:

* ✨ Add new roadmap JSON files.
* 🎨 Improve UI/UX and responsiveness.
* 🐛 Fix bugs and improve existing features.
* ♻️ Refactor and optimize code.
* 📝 Improve documentation.
* 💡 Suggest new ideas and enhancements.

---

# 🚀 Local Development Setup

## Prerequisites

Make sure you have:

* Node.js (v18 or later)
* npm
* Git

## Installation

### 1. Fork the repository

Click the **Fork** button on GitHub.

### 2. Clone your fork

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/CampussCompass.git
cd CampussCompass
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create environment variables

```bash
cp .env.example .env
```

### 5. Start the development server

```bash
npm run dev
```

---

# 📂 Project Structure

```text
CampussCompass/
├── .github/       # GitHub workflows and templates
├── api/           # API-related files
├── config/        # Configuration files
├── controllers/   # Business logic
├── data/          # Roadmaps and datasets
├── docs/          # Project documentation
├── models/        # Database models
├── public/        # Static assets
├── routes/        # Application routes
├── views/         # EJS templates and frontend views
├── app.js         # Application entry point
└── package.json   # Dependencies and scripts
```

---

# 🌿 Branch Naming Convention

Please use descriptive branch names:

```text
feature/add-study-planner
feature/add-roadmap
fix/navbar-overflow
fix/login-validation
docs/update-contributing-guide
refactor/improve-controller-logic
```

---

# ✍️ Commit Message Guidelines

We follow **Conventional Commits**:

```text
feat: add study planner feature
fix: resolve mobile navbar issue
docs: update contribution guide
refactor: simplify roadmap controller
style: improve dashboard spacing
```

---

# 🎯 Issue Assignment Guidelines

To avoid duplicate work:

1. Browse open issues.
2. Comment before starting work.
3. Wait for assignment from a maintainer.
4. Avoid working on issues assigned to others.
5. Respect issue ownership.
6. Submit your Pull Request within a reasonable timeframe.

---

# 🛠️ Contribution Workflow

### 1. Find or Create an Issue

* Browse open issues.
* Ask to be assigned.
* Wait for approval.

### 2. Fork the Repository

Create your own copy of the repository.

### 3. Clone the Repository

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/CampussCompass.git
cd CampussCompass
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 5. Make Changes

Implement your changes and test locally.

### 6. Commit Changes

```bash
git add .
git commit -m "feat: add new roadmap"
```

### 7. Push Changes

```bash
git push origin feature/your-feature-name
```

### 8. Open a Pull Request

* Link the issue.
* Fill out the PR template.
* Add screenshots if applicable.

---

# 🧹 Coding Standards

## General

* Use meaningful variable and function names.
* Write readable and maintainable code.
* Keep functions small and reusable.
* Remove unused code.

## Architecture

* Routes belong in `/routes`.
* Business logic belongs in `/controllers`.
* Database models belong in `/models`.

## Frontend

* Maintain responsive design.
* Use consistent formatting.
* Follow accessibility best practices.
* Prefer reusable components.

---

# ✅ Pull Request Checklist

Before submitting your Pull Request:

* [ ] Code tested locally.
* [ ] Linked to an issue.
* [ ] No console errors.
* [ ] Documentation updated if required.
* [ ] Responsive design verified.
* [ ] Follows coding standards.
* [ ] Screenshots added for UI changes.

---

# ❓ Frequently Asked Questions

<details>
<summary>How do I get assigned an issue?</summary>

Comment on the issue and wait for a maintainer to assign it.

</details>

<details>
<summary>Can I work on multiple issues?</summary>

Yes, as long as they are assigned to you.

</details>

<details>
<summary>How do I test my changes?</summary>

Run:

```bash
npm run dev
```

and verify your changes locally.

</details>

<details>
<summary>How long does review take?</summary>

Review times depend on maintainer availability and contribution volume.

</details>

<details>
<summary>I am new to open source. Can I still contribute?</summary>

Absolutely! Beginners are welcome and encouraged to contribute.

</details>

---

# 🔄 Contribution Flow Diagram

```text
Issue
  ↓
Comment & Get Assigned
  ↓
Fork Repository
  ↓
Clone Repository
  ↓
Create Branch
  ↓
Implement Changes
  ↓
Test Locally
  ↓
Commit Changes
  ↓
Open Pull Request
  ↓
Code Review
  ↓
Merge
```

---

# ❤️ Thank You

Every contribution, whether it's code, documentation, bug reports, or suggestions, helps make CampusCompass better.

Happy Contributing! 🚀
