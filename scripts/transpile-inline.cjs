const fs=require('fs');
const path=require('path');
const babel=require('@babel/core');
const root=process.cwd();
const file=path.join(root,'public_web','index.html');
let s=fs.readFileSync(file,'utf8');
const startMarker = '<script>// Development flag:';
const startIndex = s.indexOf(startMarker);
if (startIndex === -1) { console.error('inline script start not found'); process.exit(2); }
const afterScriptIdx = s.indexOf('>', startIndex) + 1;
const closeIdx = s.indexOf('</script>', afterScriptIdx);
if (closeIdx === -1) { console.error('closing </script> not found'); process.exit(3); }
const scriptContent = s.slice(afterScriptIdx, closeIdx);
console.log('Script length', scriptContent.length);
const result = babel.transformSync(scriptContent, {
  presets: [['@babel/preset-env',{ targets: { ios: '12' } }], ['@babel/preset-react',{runtime:'automatic'}]],
  sourceType: 'script', compact: false, retainLines: true,
});
if (!result || !result.code) { console.error('babel failed'); process.exit(4); }
const safeCode = result.code.replace(/<\/script/gi, '<\\/script');
const newHtml = s.slice(0, afterScriptIdx) + '\n' + safeCode + '\n' + s.slice(closeIdx);
fs.writeFileSync(file, newHtml, 'utf8');
console.log('Transpiled inline script written to', file);
