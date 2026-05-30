/* Google Apps Script — Web App API
   Deploy: Implantar → Novo Web App → Executar como: Você → Acesso: Qualquer pessoa */

function doGet(e) {
  if (!e) return jsonp({ error: 'No event' }, null);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  const action = e.parameter.action;
  const cb = e.parameter.callback || null;

  if (action === 'getLeaderboard') return jsonp(getSheetData(ss, 'leaderboard'), cb);
  if (action === 'getProfessors') return jsonp(getSheetData(ss, 'professors'), cb);
  if (action === 'verifyProfessor') {
    const rows = getSheetData(ss, 'professors');
    const found = rows.find(r => r.code === e.parameter.code);
    return jsonp({ exists: !!found, professor: found || null }, cb);
  }
  return jsonp({ error: 'Unknown action' }, cb);
}

function doPost(e) {
  if (!e) return textResponse(JSON.stringify({ error: 'No event' }));
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  let data;
  try { data = JSON.parse(e.postData.contents); } catch { return textResponse(JSON.stringify({ error: 'Invalid JSON' })); }

  if (data.action === 'saveResult') {
    ss.getSheetByName('leaderboard').appendRow([
      new Date().toISOString(), data.name || '', data.score || 0, data.wrong || 0,
      data.pct || 0, data.time || 0, data.date || '', data.activity || 'staff',
      data.clef || '', data.difficulty || '',
    ]);
    return textResponse(JSON.stringify({ success: true }));
  }
  if (data.action === 'registerProfessor') {
    ss.getSheetByName('professors').appendRow([
      data.code || '', data.schoolName || '', data.subject || '', new Date().toISOString(),
    ]);
    return textResponse(JSON.stringify({ success: true }));
  }
  if (data.action === 'verifyProfessor') {
    const rows = getSheetData(ss, 'professors');
    const found = rows.find(r => r.code === data.code);
    return textResponse(JSON.stringify({ exists: !!found, professor: found || null }));
  }
  if (data.action === 'deleteStudent') {
    const s = ss.getSheetByName('leaderboard');
    const all = s.getDataRange().getValues();
    if (all.length < 2) return textResponse(JSON.stringify({ success: true }));
    const header = all[0];
    const nameIdx = header.indexOf('name');
    if (nameIdx === -1) return textResponse(JSON.stringify({ success: true }));
    const keep = [all[0]];
    for (let i = 1; i < all.length; i++) {
      if (all[i][nameIdx] !== data.name) keep.push(all[i]);
    }
    s.clearContents();
    s.getRange(1, 1, keep.length, keep[0].length).setValues(keep);
    return textResponse(JSON.stringify({ success: true }));
  }
  if (data.action === 'deleteTeacher') {
    const s = ss.getSheetByName('professors');
    const all = s.getDataRange().getValues();
    if (all.length < 2) return textResponse(JSON.stringify({ success: true }));
    const header = all[0];
    const codeIdx = header.indexOf('code');
    if (codeIdx === -1) return textResponse(JSON.stringify({ success: true }));
    const keep = [all[0]];
    for (let i = 1; i < all.length; i++) {
      if (all[i][codeIdx] !== data.code) keep.push(all[i]);
    }
    s.clearContents();
    s.getRange(1, 1, keep.length, keep[0].length).setValues(keep);
    return textResponse(JSON.stringify({ success: true }));
  }
  return textResponse(JSON.stringify({ error: 'Unknown action' }));
}

function setupSheets(ss) {
  ['leaderboard', 'professors'].forEach(name => {
    if (!ss.getSheetByName(name)) {
      const s = ss.insertSheet(name);
      if (name === 'leaderboard') s.appendRow(['timestamp','name','score','wrong','pct','time','date','activity','clef','difficulty']);
      else if (name === 'professors') s.appendRow(['code','schoolName','subject','createdAt']);
    }
  });
}

function getSheetData(ss, name) {
  const s = ss.getSheetByName(name);
  if (!s) return [];
  const data = s.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, idx) => { row[h] = data[i][idx]; });
    rows.push(row);
  }
  return rows;
}

function jsonp(obj, cb) {
  const json = JSON.stringify(obj);
  const output = cb ? cb + '(' + json + ')' : json;
  return ContentService.createTextOutput(output)
    .setMimeType(cb ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function textResponse(json) {
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
