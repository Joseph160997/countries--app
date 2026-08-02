export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // La lista estándar no incluye "security" — el commit de la key
    // filtrada de la Fase 0 lo usó, y es un tipo legítimo para este repo.
    // Extender el enum es una decisión de equipo, documentada aquí.
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "security",
      ],
    ],
  },
};
