# 🤝 Contributing to CampusCompass

First of all, thank you for checking out CampusCompass! We are excited to have you join our open-source community. This project is built to be simple and beginner-friendly so that college students can learn both how the product works and how to contribute to open-source initiatives like **GSSoC** and **Hacktoberfest**.

Below is a step-by-step guide to help you start contributing.

---

## 🧭 How Can I Contribute?

You can contribute in several ways:
- **Adding Roadmaps**: Propose and create new roadmap JSON files (e.g., Android Developer, Product Manager, DevOps Engineer) in the `data/roadmaps/` folder.
- **Improving UI/UX**: Enhance stylesheets, fix layout bugs on mobile devices, or build smooth CSS animations.
- **Refactoring Code**: Clean up routing, add form input validation, or improve controller performance.
- **Reporting Bugs**: Find a bug? Log it under our issue templates so others can investigate.
- **Documentation**: Correct typos, improve README files, or expand developer setup instructions.

---

## 🛠️ Contribution Workflow

### 1. Find or Create an Issue
Before making any code changes, check the [Issues Tab](https://github.com/your-username/CampusCompass/issues) to see if someone is already working on it.
- If it exists, comment to ask if you can be assigned.
- If it does not exist, open a new issue describing what you want to fix or add. Wait for project maintainers to approve and assign it to you before writing code.

### 2. Fork the Repository
Click the **Fork** button at the top right of this repository page to create a copy under your GitHub account.

### 3. Clone Your Fork
Clone your fork to your computer:
```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/CampusCompass.git
cd CampusCompass
```

### 4. Create a New Branch
Always create a descriptive branch for your work:
```bash
# For features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b bugfix/issue-id-short-description
```

### 5. Code & Test
- Implement your modifications, keeping code simple and commenting your logic.
- Test your changes locally by running `npm run dev`. Verify it renders correctly on desktop and mobile screens.

### 6. Commit Your Changes
Use meaningful and clear commit messages:
```bash
git add .
git commit -m "feat: add Android Developer roadmap JSON file"
```

### 7. Push to GitHub
Push your commits to your remote fork repository:
```bash
git push origin feature/your-feature-name
```

### 8. Create a Pull Request (PR)
Go to the original CampusCompass repository on GitHub. You will see a prompt to compare and open a Pull Request.
- Select our Pull Request template.
- Explain what you did and link the issue number (e.g., `Closes #12`).
- Submit!

---

## 📜 Coding Conventions

- **Clean Naming**: Use camelCase for variables/functions (e.g. `calculateProgress`) and descriptive names.
- **MVC Architecture**: Route endpoints go in `/routes`, business logic goes in `/controllers`, and models go in `/models`.
- **Vanilla CSS**: Avoid importing custom frameworks (like Tailwind) unless explicitly requested. Define reusable style tokens in `:root` of `style.css`.
- **Beginner-Friendly**: Avoid overly nested logic or dense structures. Keep code readable.

Thank you for making CampusCompass better! Happy coding! 🚀
