document.addEventListener('DOMContentLoaded', () => {
  function round2(value) {
    if (typeof value === 'number') return Math.round(value * 100) / 100;
    if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
      const n = Number(value);
      return Math.round(n * 100) / 100;
    }
    return value;
  }
  const searchBtn = document.getElementById('search-btn');
  const sbdInput = document.getElementById('sbd-input');
  const resultContainer = document.getElementById('result-container');

  let studentData = [];
  let allScores = {};
  let subjectStats = {};

 const combinations = {
  // Traditional NATURAL + LANGUAGE blocks
  A00: ['Toán','Lí','Hóa'],                    // common A block :contentReference[oaicite:1]{index=1}
  A01: ['Toán','Lí','NN'],                    // common A01 :contentReference[oaicite:2]{index=2}
  A02: ['Toán','Lí','Sinh'],                  // natural block variant :contentReference[oaicite:3]{index=3}
  A03: ['Toán','Lí','Sử'],                    // extended :contentReference[oaicite:4]{index=4}
  A04: ['Toán','Lí','Địa'],                   // extended :contentReference[oaicite:5]{index=5}
  A05: ['Toán','Hóa','Sử'],                   // extended :contentReference[oaicite:6]{index=6}
  A06: ['Toán','Hóa','Địa'],                  // extended :contentReference[oaicite:7]{index=7}
  A08: ['Toán','Lí','GDKT&PL'],               // with GDKT&PL :contentReference[oaicite:8]{index=8}
  A10: ['Toán','Hóa','GDKT&PL'],              // with GDKT&PL :contentReference[oaicite:9]{index=9}

  // HEALTH / BIO SCIENCE oriented
  B00: ['Toán','Hóa','Sinh'],                 // common B block :contentReference[oaicite:10]{index=10}
  B02: ['Toán','Sinh','Địa'],                 // variant :contentReference[oaicite:11]{index=11}
  B03: ['Toán','Sinh','Văn'],                 // variant :contentReference[oaicite:12]{index=12}

  // SOCIAL SCIENCE / HUMANITIES
  C00: ['Văn','Sử','Địa'],                    // common C block :contentReference[oaicite:13]{index=13}
  C01: ['Văn','Toán','Lí'],                   // extended C :contentReference[oaicite:14]{index=14}
  C02: ['Văn','Toán','Hóa'],                  // extended C :contentReference[oaicite:15]{index=15}
  C03: ['Văn','Toán','Sử'],                   // extended C :contentReference[oaicite:16]{index=16}
  C04: ['Văn','Toán','Địa'],                  // extended C :contentReference[oaicite:17]{index=17}
  C08: ['Văn','Hóa','Sinh'],                  // extended C :contentReference[oaicite:18]{index=18}

  // D-series mixing lit + math + language
  D01: ['Văn','Toán','NN'],                   // most used D :contentReference[oaicite:19]{index=19}
  D07: ['Toán','Hóa','NN'],                   // popular variant :contentReference[oaicite:20]{index=20}
  D09: ['Toán','NN','Sử'],                    // D block variant :contentReference[oaicite:21]{index=21}
  D11: ['Văn','Lí','NN'],                     // D variant :contentReference[oaicite:22]{index=22}
  D12: ['Văn','Hóa','NN'],                    // D variant :contentReference[oaicite:23]{index=23}
  D13: ['Văn','Sinh','NN'],                   // D variant :contentReference[oaicite:24]{index=24}
  D14: ['Văn','Sử','NN'],                     // common D :contentReference[oaicite:25]{index=25}
  D15: ['Văn','Địa','NN'],                    // common D :contentReference[oaicite:26]{index=26}
  D66: ['Văn','GDKT&PL','NN'],                // common D with law/econ :contentReference[oaicite:27]{index=27}

  // D-series alternate combos
  D10: ['Toán','Địa','NN'],                   // D variant :contentReference[oaicite:28]{index=28}
  D16: ['Toán','Địa','Lí'],                   // D variant :contentReference[oaicite:29]{index=29}

  // GDKT&PL focused
  X01: ['Văn','Toán','GDKT&PL'],              // available combo :contentReference[oaicite:30]{index=30}
  X70: ['Văn','Sử','GDKT&PL'],                // GDKT&PL combo :contentReference[oaicite:31]{index=31}
  X74: ['Văn','Địa','GDKT&PL'],               // GDKT&PL combo :contentReference[oaicite:32]{index=32}

  // Additional language mixes
  D02: ['Văn','Toán','NN'],                   // NN = Russian variant :contentReference[oaicite:33]{index=33}
  D03: ['Văn','Toán','NN'],                   // NN = French :contentReference[oaicite:34]{index=34}
  D04: ['Văn','Toán','NN'],                   // NN = Chinese :contentReference[oaicite:35]{index=35}
  D05: ['Văn','Toán','NN'],                   // NN = German :contentReference[oaicite:36]{index=36}
  D06: ['Văn','Toán','NN'],                   // NN = Japanese :contentReference[oaicite:37]{index=37}
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
        if (k === 'TB') {
          subjectStats[k] = {};
        } else {
          subjectStats[k] = { avg: round2(scores.reduce((a,b)=>a+b,0)/scores.length) };
        }
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
      if (['A00','A01','B00','C00','C01','C02','D01','D07','D09','D14','D15','D66'].includes(k)) continue;
      if (s[k] == null) continue;

      let pct = '', avg = '';
      if (allScores[k]) {
        const sVal = Number(s[k]);
        const c = allScores[k].filter(v => v <= sVal).length;
        pct = Math.round((c / allScores[k].length) * 100) + 'th';
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
      const c = allScores[k].filter(v => v <= sVal).length;
      const pct = Math.round((c / allScores[k].length) * 100) + 'th';
      const avg = subjectStats[k]?.avg != null ? `avg ${round2(subjectStats[k].avg).toFixed(2)}` : '';

      html += `
        <div class="row">
          <div class="label">${k}</div>
          <div class="value">${round2(s[k]).toFixed(2)}</div>
          <div class="meta"><span class="pct">${pct}</span><span class="avg">${avg}</span></div>
        </div>`;
    }

    html += '</div>';
    resultContainer.innerHTML = html;
  };
});