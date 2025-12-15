document.addEventListener('DOMContentLoaded', () => {
  function round2(value) {
    if (typeof value === 'number') return Math.round(value * 100) / 100;
    if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
      const n = Number(value);
      return Math.round(n * 100) / 100;
    }
    return value;
  }

  function lower_bound(arr, value) {
    let low = 0;
    let high = arr.length;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] < value) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
  }
  const searchBtn = document.getElementById('search-btn');
  const sbdInput = document.getElementById('sbd-input');
  const resultContainer = document.getElementById('result-container');

  let studentData = [];
  let allScores = {};
  let subjectStats = {};

  const combinations = {
    A00: ['Toán','Lí','Hóa'],
    A01: ['Toán','Lí','NN'],
    B00: ['Toán','Hóa','Sinh'],
    C00: ['Văn','Sử','Địa'],
    C01: ['Văn','Toán','Lí'],
    C02: ['Văn','Toán','Hóa'],
    D01: ['Văn','Toán','NN'],
    D07: ['Toán','Hóa','NN'],
    D09: ['Toán','NN','Sử'],
    D14: ['Văn','NN','Sử'],
    D15: ['Văn','NN','Địa'],
    D66: ['Văn','NN','GDKT&PL']
  };

  fetch('data/điểm khối 12.jsonl')
    .then(r => r.text())
    .then(text => {
      studentData = text.trim().split('\n').map(l => JSON.parse(l));

      studentData.forEach(s => {
        for (const k in combinations) {
          const subs = combinations[k];
          let sum = 0;
          for (const sub of subs) {
              if (s[sub] == null) { sum = null; break; }
              const v = Number(s[sub]);
              if (!Number.isFinite(v)) { sum = null; break; }
              sum += v;
          }
          s[k] = sum;
        }
      });

      const keys = ['Toán','Văn','NN','Lí','Hóa','Sinh','Sử','Địa','GDKT&PL','TB', ...Object.keys(combinations)];

      keys.forEach(k => {
        const scores = studentData
          .map(s => s[k])
          .filter(v => v != null)
          .map(v => (typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)) ? Number(v) : NaN)))
          .filter(v => Number.isFinite(v));
        if (!scores.length) return;
        allScores[k] = [...scores].sort((a,b)=>a-b);
        subjectStats[k] = { avg: round2(scores.reduce((a,b)=>a+b,0)/scores.length) };
      });
    });

  searchBtn.onclick = () => {
    const sbd = sbdInput.value.trim();
    const s = studentData.find(x => String(x.SBD) === sbd);

    if (!s) {
      resultContainer.innerHTML = '<p>Không tìm thấy thí sinh.</p>';
      return;
    }

    let html = '<h2>Thông tin thí sinh</h2><div class="card">';

    for (const k in s) {
      if (k in combinations) continue;
      if (s[k] == null) continue;

      let pct = '', avg = '';
      if (allScores[k]) {
        const sVal = Number(s[k]);
        const n = allScores[k].length;
          const c = lower_bound(allScores[k], sVal);
        const rank = n > 1 ? c / (n - 1) : 1;
        pct = Math.round(rank * 100) + 'th';
        avg = subjectStats[k]?.avg != null ? `avg ${round2(subjectStats[k].avg).toFixed(2)}` : '';
      }

      html += `
        <div class="row">
          <div class="label">${k}</div>
          <div class="value">${k === 'SBD' ? s[k] : (!isNaN(Number(s[k])) ? round2(Number(s[k])).toFixed(2) : s[k])}</div>
          <div class="meta"><span class="pct">${pct}</span><span class="avg">${avg}</span></div>
        </div>`;
    }

    html += '</div><h2>Tổ hợp</h2><div class="card">';

    for (const k in combinations) {
      if (s[k] == null) continue;
      const sVal = Number(s[k]);
      const n = allScores[k].length;
        const c = lower_bound(allScores[k], sVal);
      const rank = n > 1 ? c / (n - 1) : 1;
      const pct = Math.round(rank * 100) + 'th';
      const avg = subjectStats[k]?.avg != null ? `avg ${round2(subjectStats[k].avg).toFixed(2)}` : '';

      html += `
        <div class="row">
          <div class="label">${k}</div>
          <div class="value">${round2(s[k]).toFixed(2)}</div>
          <div class="meta"><span class="pct">${pct}</span><span class="avg">${avg}</span></div>
        </div>`;
    }

    html += '</div>';

    html += `<div style="margin-top: 20px; font-size: 0.9em; color: #666;">
      <p><b>Note:</b> All calculations are performed directly in your browser from a static data file; no backend server is used.</p>
      <p>Percentile ranks are calculated using a method equivalent to Excel's <code>PERCENTRANK.INC</code> formula.</p>
      <p><b>How to read percentile:</b> A percentile of <b>75th</b> means the student scored higher than 75% of other students.</p>
    </div>`;

    resultContainer.innerHTML = html;
  };
});