import fs from "fs";
import path from "path";
import crypto from "crypto";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const inDir = path.resolve(process.cwd(), arg("--in", "src/assets/pdfs/layouts"));
const outFile = path.resolve(process.cwd(), arg("--out", "src/app/data/layouts.auto.ts"));
const baseUrl = arg("--baseUrl", "assets/pdfs/layouts"); // usado no pdfUrl

if (!fs.existsSync(inDir)) {
  console.error("❌ Pasta não encontrada:", inDir);
  process.exit(1);
}

const BANK_MAP = [
  { key: ["banco do brasil", "bb_", "bb "], numero: "001", nome: "Banco do Brasil" },
  { key: ["bradesco"], numero: "237", nome: "Bradesco" },
  { key: ["itau", "itaú"], numero: "341", nome: "Itaú" },
  { key: ["santander"], numero: "033", nome: "Santander" },
  { key: ["caixa", "cef"], numero: "104", nome: "Caixa Econômica Federal" },
  { key: ["sicredi"], numero: "748", nome: "Sicredi" },
  { key: ["sicoob"], numero: "756", nome: "Sicoob" },
  { key: ["banrisul"], numero: "041", nome: "Banrisul" },
  { key: ["inter"], numero: "077", nome: "Banco Inter" },
  { key: ["btg"], numero: "208", nome: "BTG Pactual" },
  { key: ["hsbc"], numero: "399", nome: "HSBC" },
  { key: ["boa vista", "boavista"], numero: "???", nome: "Boa Vista" },
];

function detectBank(fileName) {
  const s = fileName.toLowerCase();
  for (const b of BANK_MAP) {
    if (b.key.some(k => s.includes(k))) return { bancoNumero: b.numero, bancoNome: b.nome };
  }
  // fallback: usa começo do nome como "nome"
  const nice = fileName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
  return { bancoNumero: "???", bancoNome: nice.split(" ").slice(0, 3).join(" ") || "Desconhecido" };
}

function detectTipo(fileName) {
  const s = fileName.toLowerCase();
  if (s.includes("cnab240") || s.includes("cnab 240")) return "CNAB240";
  if (s.includes("cnab400") || s.includes("cnab 400")) return "CNAB400";
  if (s.includes("febra") || s.includes("febraban")) return "Febraban";
  return "Outro";
}

function detectVersao(fileName) {
  const s = fileName.toLowerCase();

  // padrões: v10_06, v10.7, v_10_06, versao 06-2008 etc
  const m1 = s.match(/v(?:ersao)?[_\s-]*([0-9]{1,3}(?:[._-][0-9]{1,3}){1,3})/i);
  if (m1?.[1]) return m1[1].replace(/_/g, ".").replace(/-/g, ".");

  const m2 = s.match(/vrs[_\s-]*([0-9]{4,8})/i);
  if (m2?.[1]) return m2[1];

  return undefined;
}

function detectData(fileName, stat) {
  const s = fileName;

  // ddmmyyyy ou dd_mm_yyyy ou dd-mm-yyyy
  let m = s.match(/(\d{2})[._-]?(\d{2})[._-]?(\d{4})/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;

  // yyyymmdd
  m = s.match(/(\d{4})[._-]?(\d{2})[._-]?(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;

  // fallback: mtime do arquivo
  const d = new Date(stat.mtimeMs);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function makeId(bancoNumero, tipo, fileName) {
  const base = `${bancoNumero}-${tipo}-${fileName}`.toLowerCase();
  const h = crypto.createHash("md5").update(base).digest("hex").slice(0, 6);
  return `${bancoNumero}-${tipo.toLowerCase()}-${h}`;
}

function escapeTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

const pdfFiles = fs
  .readdirSync(inDir, { withFileTypes: true })
  .filter(d => d.isFile() && d.name.toLowerCase().endsWith(".pdf"))
  .map(d => d.name)
  .sort((a, b) => a.localeCompare(b, "pt-BR"));

const layouts = pdfFiles.map(fileName => {
  const full = path.join(inDir, fileName);
  const stat = fs.statSync(full);

  const { bancoNumero, bancoNome } = detectBank(fileName);
  const tipoLayout = detectTipo(fileName);
  const versao = detectVersao(fileName);
  const atualizadoEm = detectData(fileName, stat);

  const id = makeId(bancoNumero, tipoLayout, fileName);

  return {
    id,
    bancoNumero,
    bancoNome,
    tipoLayout,
    versao,
    status: "Ativo",
    descricao: `PDF importado automaticamente: ${fileName}`,
    atualizadoEm,
    pdfUrl: `${baseUrl}/${fileName}` // mantém o nome real do arquivo
  };
});

const content = `/**
 * AUTO-GERADO por: gerar-layouts-data.mjs
 * Pasta: ${inDir}
 * NÃO edite manualmente (vai sobrescrever).
 */

import { BancoLayout } from './layouts.data';

export const LAYOUTS_BANCO: BancoLayout[] = [
${layouts.map(l => `  {
    id: '${escapeTs(l.id)}',
    bancoNumero: '${escapeTs(l.bancoNumero)}',
    bancoNome: '${escapeTs(l.bancoNome)}',
    tipoLayout: '${escapeTs(l.tipoLayout)}',
    ${l.versao ? `versao: '${escapeTs(l.versao)}',` : ""}
    status: 'Ativo',
    descricao: \`${escapeTs(l.descricao)}\`,
    atualizadoEm: '${escapeTs(l.atualizadoEm)}',
    pdfUrl: '${escapeTs(l.pdfUrl)}',
  },`).join("\n")}
];
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, content, "utf-8");

console.log("✅ Gerado:", outFile);
console.log("📄 PDFs encontrados:", pdfFiles.length);
