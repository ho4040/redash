import { map } from 'lodash';

function buildTableColumnKeywords(table) {
  const keywords = [];
  table.columns.forEach((column) => {
    keywords.push({
      caption: column.name,
      name: `${table.name}.${column.name}`,
      value: `${table.name}.${column.name}`,
      score: 100,
      meta: 'Column',
      className: 'completion',
    });
  });
  return keywords;
}

function buildKeywordsFromSchema(schema) {
  const tableKeywords = [];
  const columnKeywords = {};
  const tableColumnKeywords = {};

  schema.forEach((table) => {
    tableKeywords.push({
      name: table.name,
      value: table.name,
      score: 100,
      meta: 'Table',
    });
    tableColumnKeywords[table.name] = buildTableColumnKeywords(table);
    table.columns.forEach((c) => {
      columnKeywords[c.name] = 'Column';
    });
  });

  return {
    table: tableKeywords,
    column: map(columnKeywords, (v, k) => ({
      name: k,
      value: k,
      score: 50,
      meta: v,
    })),
    tableColumn: tableColumnKeywords,
  };
}

export default {
  buildKeywordsFromSchema,
};
