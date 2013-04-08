var config = module.exports;





config["jmask.lib"] = {
    env: "browser",
    rootPath: "../",
    sources: [
        ".import/mask.js",
        "lib/mask.binding.js"
    ],
    tests: [
        "test/*-browser.js"
    ]
};
