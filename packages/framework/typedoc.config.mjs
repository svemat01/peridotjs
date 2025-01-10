/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    // entryPoints: ["src/index.ts", "src/structures/container.ts", ],
    entryPoints: ["src/"],
    entryPointStrategy: "expand",
    projectDocuments: ["CHANGELOG.md"],
};

export default config;
