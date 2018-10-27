const fs = require('fs');
const root = `http://localhost:8080`;

fs.writeFileSync(
  __dirname + '/studies.json',
  JSON.stringify({
    'ax-lung': fs
      .readdirSync(__dirname + '/ax-lung')
      .map(fn => `wadouri:/images/ax-lung/${fn}`)
      .filter(fn => fn.substring(fn.length - 4) === '.dcm'),
    't1-brain': fs
      .readdirSync(__dirname + '/t1-brain')
      .map(fn => `wadouri:/images/t1-brain/${fn}`)
      .filter(fn => fn.substring(fn.length - 4) === '.dcm'),
  })
);
