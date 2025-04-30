
let questions = JSON.parse(localStorage.getItem("questions") || "[]");
let review = JSON.parse(localStorage.getItem("review") || "[]");
let memos = JSON.parse(localStorage.getItem("memos") || "{}");
let filtered = [];
let current = 0;

function saveAll() {
  localStorage.setItem("questions", JSON.stringify(questions));
  localStorage.setItem("review", JSON.stringify(review));
  localStorage.setItem("memos", JSON.stringify(memos));
}

function showAddForm() {
  const app = document.getElementById("app");
  app.innerHTML = \`
    <h3>문제 추가</h3>
    <input id="q" placeholder="문제">
    \${[...Array(6).keys()].map(i => \`<input id="c\${i}" placeholder="선지 \${i+1}">\`).join("")}
    <input id="a" placeholder="정답 번호 (예: 1,3)">
    <input id="e" placeholder="해설">
    <input id="src" placeholder="출처 (예: 2022 야마)">
    <input id="chap" placeholder="챕터 (예: Ch19)">
    <button onclick="saveQuestion()">저장</button>
  \`;
}

function saveQuestion() {
  const q = document.getElementById("q").value;
  const choices = [...Array(6).keys()].map(i => document.getElementById("c"+i).value).filter(c => c);
  const answer = document.getElementById("a").value.split(',').map(x => parseInt(x.trim()));
  const explanation = document.getElementById("e").value;
  const source = document.getElementById("src").value;
  const chapter = document.getElementById("chap").value;

  questions.push({q, choices, answer, explanation, source, chapter});
  saveAll();
  alert("저장 완료!");
  showAddForm();
}

function startCategorySelection() {
  const app = document.getElementById("app");
  const chapters = [...new Set(questions.map(q => q.chapter))];
  const sources = [...new Set(questions.map(q => q.source))];
  const yamYears = [...new Set(questions.filter(q => q.source.includes("야마")).map(q => q.source.match(/\d{4}/)?.[0]).filter(Boolean))];

  app.innerHTML = \`
    <h3>카테고리 선택</h3>
    <label>챕터 선택</label>
    \${chapters.map(ch => \`<label><input type="checkbox" name="ch" value="\${ch}">\${ch}</label>\`).join("")}
    <label>출처 선택</label>
    \${sources.map(s => \`<label><input type="checkbox" name="src" value="\${s}">\${s}</label>\`).join("")}
    <label>야마 연도 선택</label>
    \${yamYears.map(y => \`<label><input type="checkbox" name="yr" value="\${y}">\${y}</label>\`).join("")}
    <button onclick="filterAndStart()">문제풀기 시작</button>
  \`;
}

function filterAndStart() {
  const ch = getChecked("ch");
  const src = getChecked("src");
  const yr = getChecked("yr");

  filtered = questions.filter(q =>
    (ch.length === 0 || ch.includes(q.chapter)) &&
    (src.length === 0 || src.includes(q.source)) &&
    (!q.source.includes("야마") || yr.length === 0 || yr.some(y => q.source.includes(y)))
  );

  current = 0;
  showQuestion();
}

function showQuestion() {
  if (!filtered.length) return alert("해당 조건의 문제가 없습니다.");

  const q = filtered[current];
  const app = document.getElementById("app");
  app.innerHTML = \`
    <h3>문제</h3>
    <p>\${q.q}</p>
    \${q.choices.map((c,i)=>\`<label><input type="checkbox" name="ans" value="\${i}">\${c}</label>\`).join("")}
    <button onclick="checkAnswer()">정답 확인</button>
    <button onclick="addMemo()">메모 추가</button>
    <button onclick="viewMemo()">이전 메모 보기</button>
    <button onclick="saveReview()">다시 볼 문제로 저장</button>
    <p id="explain"></p>
  \`;
}

function checkAnswer() {
  const user = getChecked("ans").map(n => parseInt(n));
  const correct = filtered[current].answer;
  const match = user.sort().toString() === correct.sort().toString();
  document.getElementById("explain").innerText = match ? "정답입니다!" : "오답입니다. 해설: " + filtered[current].explanation;
}

function addMemo() {
  const m = prompt("메모를 입력하세요:", memos[current] || "");
  if (m !== null) {
    memos[current] = m;
    saveAll();
  }
}

function viewMemo() {
  alert("메모: " + (memos[current] || "없음"));
}

function saveReview() {
  if (!review.includes(current)) {
    review.push(current);
    saveAll();
    alert("저장되었습니다.");
  }
}

function showReviewList() {
  const app = document.getElementById("app");
  app.innerHTML = "<h3>다시 볼 문제 모음집</h3>" + review.map(i => "<p>"+questions[i].q+"</p>").join("");
}

function showMemoList() {
  const app = document.getElementById("app");
  app.innerHTML = "<h3>필기 모음집</h3>" +
    Object.entries(memos).map(([i,m]) => "<p><b>"+questions[i].q+"</b><br>"+m+"</p>").join("");
}

function getChecked(name) {
  return [...document.querySelectorAll("input[name='"+name+"']:checked")].map(c => c.value);
}
