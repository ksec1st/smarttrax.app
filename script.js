/* ==================================================
   交通費申請システム
   JavaScript
================================================== */


/* ==================================================
   Google Apps Script URL
================================================== */

const GAS_URL =
  "ここにApps ScriptのウェブアプリURLを貼り付け";


/* ==================================================
   現在ログイン中のユーザー
================================================== */

let currentUser = null;


/* ==================================================
   DOM
================================================== */

const loginScreen =
  document.getElementById("loginScreen");

const studentScreen =
  document.getElementById("studentScreen");

const teacherScreen =
  document.getElementById("teacherScreen");

const successScreen =
  document.getElementById("successScreen");

const logoutButton =
  document.getElementById("logoutButton");


/* ==================================================
   ページ読み込み
================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    restoreLogin();

    setupEvents();

  }
);


/* ==================================================
   イベント設定
================================================== */

function setupEvents() {


  /* ------------------------------------------
     ログイン
  ------------------------------------------ */

  document
    .getElementById("loginForm")
    .addEventListener(
      "submit",
      login
    );


  /* ------------------------------------------
     ログアウト
  ------------------------------------------ */

  logoutButton
    .addEventListener(
      "click",
      logout
    );


  /* ------------------------------------------
     金額
  ------------------------------------------ */

  document
    .getElementById("transportCost")
    .addEventListener(
      "input",
      updateTotal
    );


  /* ------------------------------------------
     申請
  ------------------------------------------ */

  document
    .getElementById("expenseForm")
    .addEventListener(
      "submit",
      submitApplication
    );


  /* ------------------------------------------
     生徒更新
  ------------------------------------------ */

  document
    .getElementById("refreshStudentButton")
    .addEventListener(
      "click",
      loadMyApplications
    );


  /* ------------------------------------------
     教員更新
  ------------------------------------------ */

  document
    .getElementById("refreshTeacherButton")
    .addEventListener(
      "click",
      loadAllApplications
    );


  /* ------------------------------------------
     成功画面
  ------------------------------------------ */

  document
    .getElementById("backToDashboard")
    .addEventListener(
      "click",
      () => {

        successScreen
          .classList
          .add("hidden");

        studentScreen
          .classList
          .remove("hidden");

        loadMyApplications();

      }
    );

}


/* ==================================================
   ログイン
================================================== */

async function login(event) {

  event.preventDefault();


  const input =
    document.getElementById("loginId");

  const message =
    document.getElementById("loginMessage");


  const userId =
    input.value.trim();


  if (!userId) {

    message.textContent =
      "IDを入力してください。";

    return;

  }


  message.textContent =
    "ログインしています...";


  try {

    const result =
      await apiRequest({

        action: "login",

        userId: userId

      });


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    currentUser =
      result.user;


    localStorage.setItem(
      "expenseUser",
      JSON.stringify(
        currentUser
      )
    );


    showDashboard();


  } catch (error) {

    message.textContent =
      error.message;

  }

}


/* ==================================================
   ログイン状態復元
================================================== */

function restoreLogin() {

  const saved =
    localStorage.getItem(
      "expenseUser"
    );


  if (!saved) {
    return;
  }


  try {

    currentUser =
      JSON.parse(saved);


    if (
      !currentUser ||
      !currentUser.id
    ) {

      throw new Error();

    }


    showDashboard();


  } catch {

    localStorage.removeItem(
      "expenseUser"
    );

  }

}


/* ==================================================
   ダッシュボード表示
================================================== */

function showDashboard() {

  loginScreen
    .classList
    .add("hidden");

  logoutButton
    .classList
    .remove("hidden");


  if (
    currentUser.role === "教員"
  ) {

    studentScreen
      .classList
      .add("hidden");

    teacherScreen
      .classList
      .remove("hidden");

    document
      .getElementById("studentName")
      .textContent =
      currentUser.name || "";

    loadAllApplications();

  } else {

    teacherScreen
      .classList
      .add("hidden");

    studentScreen
      .classList
      .remove("hidden");


    document
      .getElementById("studentName")
      .textContent =
      currentUser.name || "";


    /* ------------------------------------------
       自動入力
    ------------------------------------------ */

    const name =
      document.getElementById("name");

    const grade =
      document.getElementById("grade");


    name.value =
      currentUser.name || "";


    grade.value =
      currentUser.grade || "";


    loadMyApplications();

  }

}


/* ==================================================
   ログアウト
================================================== */

function logout() {

  currentUser = null;


  localStorage.removeItem(
    "expenseUser"
  );


  studentScreen
    .classList
    .add("hidden");

  teacherScreen
    .classList
    .add("hidden");

  successScreen
    .classList
    .add("hidden");

  logoutButton
    .classList
    .add("hidden");

  loginScreen
    .classList
    .remove("hidden");


  document
    .getElementById("loginId")
    .value = "";

}


/* ==================================================
   API
================================================== */

async function apiRequest(data) {

  const response =
    await fetch(
      GAS_URL,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify(data)

      }
    );


  const result =
    await response.json();


  return result;

}


/* ==================================================
   合計金額
================================================== */

function updateTotal() {

  const value =
    Number(
      document
        .getElementById("transportCost")
        .value
    ) || 0;


  document
    .getElementById("totalAmount")
    .textContent =
    value.toLocaleString();

}


/* ==================================================
   交通費申請
================================================== */

async function submitApplication(event) {

  event.preventDefault();


  if (!currentUser) {

    alert(
      "ログインしてください。"
    );

    return;

  }


  const button =
    document.getElementById(
      "submitButton"
    );


  button.disabled = true;

  button.textContent =
    "申請中...";


  try {

    const transportCost =
      Number(
        document
          .getElementById(
            "transportCost"
          )
          .value
      ) || 0;


    const data = {

      action: "submit",

      userId:
        currentUser.id,

      name:
        document
          .getElementById("name")
          .value,

      grade:
        document
          .getElementById("grade")
          .value,

      className:
        document
          .getElementById("className")
          .value,

      tripDate:
        document
          .getElementById("tripDate")
          .value,

      destination:
        document
          .getElementById("destination")
          .value,

      eventName:
        document
          .getElementById("eventName")
          .value,

      departure:
        document
          .getElementById("departure")
          .value,

      arrival:
        document
          .getElementById("arrival")
          .value,

      transportCost:
        transportCost,

      totalAmount:
        transportCost,

      note:
        document
          .getElementById("note")
          .value

    };


    const result =
      await apiRequest(data);


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    /* ------------------------------------------
       成功画面
    ------------------------------------------ */

    document
      .getElementById(
        "applicationNumber"
      )
      .textContent =
      result.applicationNumber;


    studentScreen
      .classList
      .add("hidden");


    successScreen
      .classList
      .remove("hidden");


    document
      .getElementById(
        "expenseForm"
      )
      .reset();


    updateTotal();


  } catch (error) {

    alert(
      error.message
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "交通費を申請する";

  }

}


/* ==================================================
   生徒：自分の申請
================================================== */

async function loadMyApplications() {

  if (!currentUser) {
    return;
  }


  const container =
    document.getElementById(
      "studentApplications"
    );


  container.innerHTML =
    `<div class="loading">
      読み込み中...
    </div>`;


  try {

    const result =
      await apiRequest({

        action:
          "getMyApplications",

        userId:
          currentUser.id

      });


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    renderStudentApplications(
      result.applications
    );


  } catch (error) {

    container.innerHTML =
      `<div class="empty">
        ${escapeHtml(
          error.message
        )}
      </div>`;

  }

}


/* ==================================================
   生徒：申請表示
================================================== */

function renderStudentApplications(
  applications
) {

  const container =
    document.getElementById(
      "studentApplications"
    );


  if (
    !applications ||
    applications.length === 0
  ) {

    container.innerHTML =
      `<div class="empty">
        まだ申請はありません。
      </div>`;

    return;

  }


  container.innerHTML =
    applications
      .slice()
      .reverse()
      .map(
        application =>
          createStudentApplicationCard(
            application
          )
      )
      .join("");

}


/* ==================================================
   生徒：申請カード
================================================== */

function createStudentApplicationCard(
  application
) {

  const status =
    application.status || "未確認";


  return `

    <div class="application-card">

      <div class="application-top">

        <div>

          <div class="application-number">

            ${escapeHtml(
              application.applicationNumber
            )}

          </div>

          <small>

            申請日時：
            ${escapeHtml(
              application.timestamp
            )}

          </small>

        </div>

        <span class="status status-${escapeHtml(status)}">

          ${escapeHtml(status)}

        </span>

      </div>


      <div class="application-info">

        <div class="info-item">
          <span>遠征日：</span>
          ${escapeHtml(
            application.tripDate
          )}
        </div>

        <div class="info-item">
          <span>遠征先：</span>
          ${escapeHtml(
            application.destination
          )}
        </div>

        <div class="info-item">
          <span>大会：</span>
          ${escapeHtml(
            application.eventName
          )}
        </div>

        <div class="info-item">
          <span>出発地：</span>
          ${escapeHtml(
            application.departure
          )}
        </div>

        <div class="info-item">
          <span>到着地：</span>
          ${escapeHtml(
            application.arrival
          )}
        </div>

        <div class="info-item">
          <span>合計：</span>
          ¥${Number(
            application.totalAmount || 0
          ).toLocaleString()}

        </div>

      </div>

    </div>

  `;

}


/* ==================================================
   教員：全申請
================================================== */

async function loadAllApplications() {

  if (!currentUser) {
    return;
  }


  const container =
    document.getElementById(
      "teacherApplications"
    );


  container.innerHTML =
    `<div class="loading">
      読み込み中...
    </div>`;


  try {

    const result =
      await apiRequest({

        action:
          "getAllApplications",

        userId:
          currentUser.id

      });


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    renderTeacherApplications(
      result.applications
    );


  } catch (error) {

    container.innerHTML =
      `<div class="empty">
        ${escapeHtml(
          error.message
        )}
      </div>`;

  }

}


/* ==================================================
   教員：申請一覧表示
================================================== */

function renderTeacherApplications(
  applications
) {

  const container =
    document.getElementById(
      "teacherApplications"
    );


  if (
    !applications ||
    applications.length === 0
  ) {

    container.innerHTML =
      `<div class="empty">
        現在、申請はありません。
      </div>`;

    return;

  }


  container.innerHTML =
    applications
      .slice()
      .reverse()
      .map(
        application =>
          createTeacherApplicationCard(
            application
          )
      )
      .join("");

}


/* ==================================================
   教員：申請カード
================================================== */

function createTeacherApplicationCard(
  application
) {

  const status =
    application.status || "未確認";


  const statuses = [

    "未確認",
    "確認中",
    "承認",
    "差し戻し",
    "支払済"

  ];


  const options =
    statuses
      .map(
        item => `

          <option
            value="${escapeHtml(item)}"
            ${
              item === status
                ? "selected"
                : ""
            }
          >
            ${escapeHtml(item)}
          </option>

        `
      )
      .join("");


  return `

    <div class="application-card">

      <div class="application-top">

        <div>

          <div class="application-number">

            ${escapeHtml(
              application.applicationNumber
            )}

          </div>

          <small>

            ${escapeHtml(
              application.timestamp
            )}

          </small>

        </div>


        <div class="teacher-status">

          <select
            onchange="
              changeStatus(
                '${escapeHtml(
                  application.applicationNumber
                )}',
                this.value
              )
            "
          >

            ${options}

          </select>

        </div>

      </div>


      <div class="application-info">

        <div class="info-item">
          <span>氏名：</span>
          ${escapeHtml(
            application.name
          )}
        </div>

        <div class="info-item">
          <span>学年：</span>
          ${escapeHtml(
            application.grade
          )}
        </div>

        <div class="info-item">
          <span>クラス：</span>
          ${escapeHtml(
            application.className
          )}
        </div>

        <div class="info-item">
          <span>申請者ID：</span>
          ${escapeHtml(
            application.userId
          )}
        </div>

        <div class="info-item">
          <span>遠征日：</span>
          ${escapeHtml(
            application.tripDate
          )}
        </div>

        <div class="info-item">
          <span>遠征先：</span>
          ${escapeHtml(
            application.destination
          )}
        </div>

        <div class="info-item">
          <span>大会：</span>
          ${escapeHtml(
            application.eventName
          )}
        </div>

        <div class="info-item">
          <span>出発地：</span>
          ${escapeHtml(
            application.departure
          )}
        </div>

        <div class="info-item">
          <span>到着地：</span>
          ${escapeHtml(
            application.arrival
          )}
        </div>

        <div class="info-item">
          <span>交通費：</span>
          ¥${Number(
            application.transportCost || 0
          ).toLocaleString()}
        </div>

        <div class="info-item">
          <span>合計金額：</span>
          ¥${Number(
            application.totalAmount || 0
          ).toLocaleString()}
        </div>

        <div class="info-item">
          <span>備考：</span>
          ${escapeHtml(
            application.note || "なし"
          )}
        </div>

      </div>

    </div>

  `;

}


/* ==================================================
   教員：ステータス変更
================================================== */

async function changeStatus(
  applicationNumber,
  status
) {

  if (!currentUser) {
    return;
  }


  if (
    currentUser.role !== "教員"
  ) {

    alert(
      "教員権限が必要です。"
    );

    return;

  }


  try {

    const result =
      await apiRequest({

        action:
          "updateStatus",

        userId:
          currentUser.id,

        applicationNumber:
          applicationNumber,

        status:
          status

      });


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    await loadAllApplications();


  } catch (error) {

    alert(
      error.message
    );

    await loadAllApplications();

  }

}


/* ==================================================
   HTMLエスケープ
================================================== */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}
