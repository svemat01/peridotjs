/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    entryPoints: ["packages/*"],
    name: "PeridotJS",
    entryPointStrategy: "packages",
    includeVersion: false,

    packageOptions: {
        includeVersion: true,
        entryPoints: ["src/"],
    },

    plugin: ["typedoc-material-theme"],

    navigation: {
        excludeReferences: true,
    },
    searchInComments: true,
    searchInDocuments: true,

    customCss: "./typedoc.style.css",
};

export default config;
