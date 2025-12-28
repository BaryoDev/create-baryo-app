# 🏘️ create-baryo-app

> The official interactive project initializer for the BaryoDev ecosystem. Scaffold enterprise-grade, performance-first projects in seconds.

---

![BaryoDev Banner](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072)

## 🚀 Experience the Baryo Way

Starting a new project often involves hours of manual setup—configuring folders, setting up documentation, initializing git, and defining AI rules. `create-baryo-app` does all of this for you.

With a single command, you get a "Startup in a Box" that follows the **BaryoDev Standards**:
- **Zero-Dependency Core**: Lightweight and fast.
- **Vertical Slice Architecture**: Ready for scale.
- **Smart AI Loading**: Integrated with the 19-skill BaryoDev Enterprise Suite.
- **VitePress Ready**: Documentation structure pre-configured.

## 🛠️ Usage

No installation required! Just run it directly using `npx`:

```bash
npx create-baryo-app@latest [project-name]
```

### What happens during initialization?

1.  **Interactive Prompts**: Choose your project name, description, and type.
2.  **Smart Scaffolding**: Clones the universal [BaryoDev template](https://github.com/BaryoDev/template-project).
3.  **Automatic Tailoring**: 
    - Updates `package.json` and `README.md` with your info.
    - Pre-configures `.cursorrules` activation guides based on your project type (Library, API, SaaS, etc.).
4.  **Environment Setup**: Handles `git init` and optional `npm install`.

## 📂 Project Types

| Type          | Focus                     | Key Skills Activated                                 |
| :------------ | :------------------------ | :--------------------------------------------------- |
| **📦 Library** | Performance & Zero-Deps   | `baryo-coding`, `baryo-testing`, `baryo-packaging`   |
| **🚀 Web API** | Scale & Clean Code        | `baryo-api`, `baryo-security`, `baryo-observability` |
| **🏢 SaaS**    | Robustness & Global Reach | Full Enterprise Suite (19 Skills)                    |
| **🌍 Global**  | Accessibility & Privacy   | `baryo-global`, `baryo-privacy`, `baryo-scale`       |

## 🧠 Smart AI Integration

Every project created with this CLI includes the **Smart Skill Loading** script (`scripts/get-skill.sh`). 

Your `.cursorrules` uses the **Baryo Skills Lite** catalog (saving >80% tokens), and your AI can dynamically fetch full documentation when needed:

```bash
# How the AI fetches deep expertise in your new project:
./scripts/get-skill.sh baryo-security
```

## 📜 License

This project is licensed under the **Mozilla Public License 2.0 (MPL-2.0)** - see the [LICENSE](LICENSE) file for details.

---

🏘️ Built with ❤️ in the Baryo. Join the movement at [BaryoDev](https://github.com/BaryoDev).
