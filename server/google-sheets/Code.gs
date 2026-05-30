function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  const action = e.parameter.action;

  if (action === 'getLeaderboard') {
    return jsonResponse(getSheetData(ss, 'leaderboard'));
  }
  if (action === 'getProfessors') {
    return jsonResponse(getSheetData(ss, 'professors'));
  }
  return jsonResponse({ error: 'Unknown action' });
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'saveResult') {
    ss.getSheetByName('leaderboard').appendRow([
      new Date().toISOString(), data.name || '', data.score || 0, data.wrong || 0,
      data.pct || 0, data.time || 0, data.date || '', data.activity || 'staff',
      data.clef || '', data.difficulty || '',
    ]);
    return jsonResponse({ success: true });
  }

  if (data.action === 'registerProfessor') {
    ss.getSheetByName('professors').appendRow([
      data.code || '', data.schoolName || '', data.subject || '', new Date().toISOString(),
    ]);
    return jsonResponse({ success: true });
  }

  if (data.action === 'verifyProfessor') {
    const rows = getSheetData(ss, 'professors');
    const found = rows.find(r => r.code === data.code);
    return jsonResponse({ exists: !!found, professor: found || null });
  }

  return jsonResponse({ error: 'Unknown action' });
}

function setupSheets(ss) {
  const sheets = ['leaderboard', 'professors'];
  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      const s = ss.insertSheet(name);
      if (name === 'leaderboard') {
        s.appendRow(['timestamp', 'name', 'score', 'wrong', 'pct', 'time', 'date', 'activity', 'clef', 'difficulty']);
      } else if (name === 'professors') {
        s.appendRow(['code', 'schoolName', 'subject', 'createdAt']);
      }
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

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
