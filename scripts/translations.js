import fs from 'fs';

function syncTranslations(options) {
  if (!options) options = {};
  options = Object.assign({
    outDirectory: 'dist',
    sourceLocale: 'en'
  }, options);

  const outDir = `./${options.outDirectory}/translations`;

  if (!fs.existsSync(outDir)) {
    throw new Error(`Translations directory ${outDir} does not exist. Please run the build first.`);
  }

  // Read the source file (en.json)
  const sourcePath = `${outDir}/${options.sourceLocale}.json`;
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file ${sourcePath} does not exist`);
  }
  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const sourceStrings = sourceData[options.sourceLocale];

  // Get list of language files, excluding the source
  /*const files = fs.readdirSync(outDir).filter(f =>
    f.endsWith('.json') &&
    f !== `${options.sourceLocale}.json` &&
    !f.endsWith('.min.json')
  );*/

    const files = ["fr.json", "fr-FR.json"]

  function syncObject(source, target, path) {
    for (const key in source) {
      if (!(key in target)) {
        console.log(`Adding missing key '${key}' to ${path}`);
        target[key] = JSON.parse(JSON.stringify(source[key]));
      } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
        syncObject(source[key], target[key], `${path}.${key}`);
      }
    }
    for (const key in target) {
      if (!(key in source)) {
        console.log(`Removing obsolete key '${key}' from ${path}`);
        delete target[key];
      }
    }
  }

  for (const file of files) {
    const lang = file.replace('.json', '');
    const langPath = `${outDir}/${file}`;
    let langData = {};

    if (fs.existsSync(langPath)) {
      langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    }

    if (!langData[lang]) {
      langData[lang] = {};
    }

    const targetStrings = langData[lang];

    // Sync presets
    if (sourceStrings.presets) {
      if (!targetStrings.presets) {
        targetStrings.presets = {};
      }
      syncObject(sourceStrings.presets, targetStrings.presets, `${lang}.presets`);
    } else {
      delete targetStrings.presets;
    }

    // Sync fields
    if (sourceStrings.fields) {
      if (!targetStrings.fields) {
        targetStrings.fields = {};
      }
      syncObject(sourceStrings.fields, targetStrings.fields, `${lang}.fields`);
    } else {
      delete targetStrings.fields;
    }

    // Write back the updated file
    fs.writeFileSync(langPath, JSON.stringify(langData, null, 4));
    fs.writeFileSync(`${outDir}/${lang}.min.json`, JSON.stringify(langData));
  }
}

syncTranslations();
