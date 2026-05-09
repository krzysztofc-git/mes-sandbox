// Usage: node script.js input.json
const fs = require('fs');

const infile = process.argv[2];
if (!infile) { console.error('Provide input file'); process.exit(1); }
const backup = infile + '(' + new Date().toJSON().slice(0,19) + ').bak';
const data = JSON.parse(fs.readFileSync(infile));
const map = new Map(); let n = 1;

function getId(old){
  if (!map.has(old)) map.set(old, String(n++));
  return map.get(old);
}

if (!Array.isArray(data)){
  console.error('Expected JSON array');
  process.exit(2);
}

data.forEach(node=>{
  if (node.id) node.id = getId(node.id);
  if (node.z) node.z = getId(node.z);
  if (node.type && node.type.startsWith('subflow:')) {
    const oldSubflowId = node.type.slice('subflow:'.length);
    node.type = 'subflow:'+getId(oldSubflowId);
  }
  if (Array.isArray(node.in)) {
    node.in.forEach(input => {
      if (Array.isArray(input.wires)) {
        input.wires = input.wires.map(wire =>
          ({ ...wire, id: getId(wire.id) })
        );
      }
    });
  }
  if (Array.isArray(node.out)) {
    node.out.forEach(output => {
      if (Array.isArray(output.wires)) {
        output.wires = output.wires.map(wire =>
          ({ ...wire, id: getId(wire.id) })
        );
      }
    });
  }
  if (node.wires) node.wires = node.wires.map(arr => arr.map(id => getId(id)));
  if (node.type == 'MSSQL-CN') node.id = 'mssqlcn0';
  if (node.mssqlCN) node.mssqlCN = 'mssqlcn0';
});

fs.copyFileSync(infile, backup); // create backup
fs.writeFileSync(infile, JSON.stringify(data, null, 2)); // overwrite original

console.log('Converted and backed up to', backup);