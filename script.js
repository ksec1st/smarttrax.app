/* ==================================================
   SmartTrax
   交通費申請システム
================================================== */


/* ==================================================
   設定
================================================== */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzdXE9K8JGJJCQ5cG1k7r4MxBPh6xIyDh4FFFYhzCi7PUS9euHPlSFkOnptJLrn8n83pw/exec";


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
   ログイン
================================================== */

const loginForm =
  document.getElementById("loginForm");

const loginId =
  document.getElementById("loginId");

const loginMessage =
  document.getElementById("loginMessage");


/* ==================================================
   生徒
================================================== */

const studentName =
  document.getElementById("studentName");

const expenseForm =
  document.getElementById("expenseForm");

const nameInput =
  document.getElementById("name");

const grade =
  document.getElementById("grade");

const className =
  document.getElementById("className");

const tripDate =
  document.getElementById("tripDate");

const destination =
  document.getElementById("destination");

const eventName =
  document.getElementById("eventName");

const departure =
  document.getElementById("departure");

const arrival =
  document.getElementById("arrival");

const transportCost =
  document.getElementById("transportCost");

const totalAmount =
  document.getElementById("totalAmount");

const note =
  document.getElementById("note");

const confirmCheckbox =
  document.getElementById("confirm");

const submitButton =
  document.getElementById("submitButton");


/* ==================================================
   経由地
================================================== */

const viaPoints =
  document.getElementById("viaPoints");

const addViaPoint =
  document.getElementById("addViaPoint");


/* ==================================================
   区間料金
================================================== */

const routeCosts =
  document.getElementById("routeCosts");


/* ==================================================
   生徒申請履歴
================================================== */

const studentApplications =
  document.getElementById(
    "studentApplications"
  );

const refreshStudentButton =
  document.getElementById(
    "refreshStudentButton"
  );


/* ==================================================
   教員
================================================== */

const teacherApplications =
  document.getElementById(
    "teacherApplications"
  );

const refreshTeacherButton =
  document.getElementById(
    "refreshTeacherButton"
  );


/* ==================================================
   成功画面
================================================== */

const applicationNumber =
  document.getElementById(
    "applicationNumber"
  );

const backToDashboard =
  document.getElementById(
    "backToDashboard"
  );

const newApplication =
  document.getElementById(
    "newApplication"
  );


/* ==================================================
   初期化
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


  /* ログイン */

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      handleLogin
    );

  }


  /* ログアウト */

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      logout
    );

  }


  /* 交通費 */

  if (transportCost) {

    transportCost.addEventListener(
      "input",
      updateTotal
    );

  }


  /* 出発地 */

  if (departure) {

    departure.addEventListener(
      "input",
      updateRouteCosts
    );

  }


  /* 到着地 */

  if (arrival) {

    arrival.addEventListener(
      "input",
      updateRouteCosts
    );

  }


  /* 経由地追加 */

  if (addViaPoint) {

    addViaPoint.addEventListener(
      "click",
      () => {

        addViaPointInput();

      }
    );

  }


  /* 申請 */

  if (expenseForm) {

    expenseForm.addEventListener(
      "submit",
      handleSubmit
    );

  }


  /* 生徒申請履歴 */

  if (refreshStudentButton) {

    refreshStudentButton.addEventListener(
      "click",
      loadStudentApplications
    );

  }


  /* 教員申請一覧 */

  if (refreshTeacherButton) {

    refreshTeacherButton.addEventListener(
      "click",
      loadTeacherApplications
    );

  }


  /* 新しい申請 */

  if (newApplication) {

    newApplication.addEventListener(
      "click",
      () => {

        showStudentDashboard();

        if (expenseForm) {

          expenseForm.reset();

        }

        clearViaPoints();

        updateTotal();

        updateRouteCosts();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );

  }


  /* ダッシュボード */

  if (backToDashboard) {

    backToDashboard.addEventListener(
      "click",
      () => {

        showDashboard();

      }
    );

  }

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

        body: JSON.stringify(data)

      }
    );


  if (!response.ok) {

    throw new Error(
      `通信エラー: ${response.status}`
    );

  }


  const result =
    await response.json();


  if (!result.success) {

    throw new Error(
      result.message ||
      "処理に失敗しました。"
    );

  }


  return result;

}


/* ==================================================
   ログイン
================================================== */

async function handleLogin(event) {

  event.preventDefault();


  const id =
    loginId.value.trim();


  if (!id) {

    showLoginMessage(
      "IDを入力してください。",
      true
    );

    return;

  }


  showLoginMessage(
    "ログインしています..."
  );


  try {

    const result =
      await apiRequest({

        action: "login",

        userId: id

      });


    currentUser =
      result.user;


    localStorage.setItem(
      "expenseCurrentUser",
      JSON.stringify(
        currentUser
      )
    );


    showDashboard();


  } catch (error) {

    console.error(error);


    showLoginMessage(
      error.message,
      true
    );

  }

}


/* ==================================================
   ログイン復元
================================================== */

function restoreLogin() {

  const savedUser =
    localStorage.getItem(
      "expenseCurrentUser"
    );


  if (!savedUser) {

    showLoginScreen();

    return;

  }


  try {

    currentUser =
      JSON.parse(
        savedUser
      );


    if (
      !currentUser ||
      !currentUser.id
    ) {

      throw new Error();

    }


    showDashboard();


  } catch (error) {

    localStorage.removeItem(
      "expenseCurrentUser"
    );

    showLoginScreen();

  }

}


/* ==================================================
   ログイン画面
================================================== */

function showLoginScreen() {

  hideAllScreens();


  loginScreen.classList.remove(
    "hidden"
  );


  if (logoutButton) {

    logoutButton.classList.add(
      "hidden"
    );

  }

}


/* ==================================================
   ダッシュボード
================================================== */

function showDashboard() {

  hideAllScreens();


  if (!currentUser) {

    showLoginScreen();

    return;

  }


  if (logoutButton) {

    logoutButton.classList.remove(
      "hidden"
    );

  }


  if (
    currentUser.role === "教員"
  ) {

    showTeacherDashboard();

  } else {

    showStudentDashboard();

  }

}


/* ==================================================
   生徒画面
================================================== */

function showStudentDashboard() {

  hideAllScreens();


  studentScreen.classList.remove(
    "hidden"
  );


  if (studentName) {

    studentName.textContent =
      currentUser.name || "";

  }


  if (nameInput) {

    nameInput.value =
      currentUser.name || "";

  }


  if (grade) {

    grade.value =
      currentUser.grade || "";

  }


  loadStudentApplications();

}


/* ==================================================
   教員画面
================================================== */

function showTeacherDashboard() {

  hideAllScreens();


  teacherScreen.classList.remove(
    "hidden"
  );


  loadTeacherApplications();

}


/* ==================================================
   画面を隠す
================================================== */

function hideAllScreens() {

  [
    loginScreen,
    studentScreen,
    teacherScreen,
    successScreen
  ].forEach(
    screen => {

      if (screen) {

        screen.classList.add(
          "hidden"
        );

      }

    }
  );

}


/* ==================================================
   ログアウト
================================================== */

function logout() {

  currentUser = null;


  localStorage.removeItem(
    "expenseCurrentUser"
  );


  if (expenseForm) {

    expenseForm.reset();

  }


  clearViaPoints();

  updateTotal();

  updateRouteCosts();


  showLoginScreen();

}


/* ==================================================
   ログインメッセージ
================================================== */

function showLoginMessage(
  message,
  isError = false
) {

  if (!loginMessage) {

    return;

  }


  loginMessage.textContent =
    message;


  loginMessage.className =
    isError
      ? "message error-message"
      : "message";

}


/* ==================================================
   合計金額
================================================== */

function updateTotal() {

  if (
    !transportCost ||
    !totalAmount
  ) {

    return;

  }


  const amount =
    Number(
      transportCost.value
    ) || 0;


  totalAmount.textContent =
    "¥" +
    amount.toLocaleString();

}


/* ==================================================
   経由地追加
================================================== */

function addViaPointInput(
  value = ""
) {

  if (!viaPoints) {

    return;

  }


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "via-point";


  const input =
    document.createElement(
      "input"
    );


  input.type =
    "text";

  input.className =
    "via-point-input";

  input.placeholder =
    "例：大阪駅";

  input.value =
    value;


  const removeButton =
    document.createElement(
      "button"
    );


  removeButton.type =
    "button";

  removeButton.className =
    "via-remove";

  removeButton.textContent =
    "削除";


  /* 経由地入力 */

  input.addEventListener(
    "input",
    updateRouteCosts
  );


  /* 経由地削除 */

  removeButton.addEventListener(
    "click",
    () => {

      wrapper.remove();

      updateRouteCosts();

    }
  );


  wrapper.appendChild(
    input
  );

  wrapper.appendChild(
    removeButton
  );


  viaPoints.appendChild(
    wrapper
  );


  updateRouteCosts();

}


/* ==================================================
   経由地削除
================================================== */

function clearViaPoints() {

  if (!viaPoints) {

    return;

  }


  viaPoints.innerHTML =
    "";

}


/* ==================================================
   経由地取得
================================================== */

function getViaPoints() {

  const inputs =
    document.querySelectorAll(
      ".via-point-input"
    );


  return Array.from(
    inputs
  )

    .map(
      input =>
        input.value.trim()
    )

    .filter(
      value =>
        value !== ""
    );

}


/* ==================================================
   区間料金を更新
================================================== */

function updateRouteCosts() {

  if (!routeCosts) {

    return;

  }


  const departureValue =
    departure
      ? departure.value.trim()
      : "";


  const arrivalValue =
    arrival
      ? arrival.value.trim()
      : "";


  const viaPointValues =
    getViaPoints();


  const locations = [

    departureValue,

    ...viaPointValues,

    arrivalValue

  ];


  /*
   * 出発地と到着地が
   * まだ入力されていない
   */

  if (
    !departureValue ||
    !arrivalValue
  ) {

    routeCosts.innerHTML =
      `
      <div class="route-cost-empty">

        出発地と到着地を入力すると、
        区間ごとの料金を入力できます。

      </div>
      `;

    return;

  }


  let html = "";


  /*
   * 各区間を生成
   */

  for (
    let i = 0;
    i < locations.length - 1;
    i++
  ) {

    const from =
      locations[i];

    const to =
      locations[i + 1];


    html += `

      <div class="route-cost-item">


        <div class="route-name">

          <span class="route-place">

            ${escapeHtml(from)}

          </span>


          <span class="route-arrow">
            →
          </span>


          <span class="route-place">

            ${escapeHtml(to)}

          </span>

        </div>


        <div class="route-price">

          <input
            type="number"
            class="route-cost-input"
            data-from="${escapeHtml(from)}"
            data-to="${escapeHtml(to)}"
            min="0"
            placeholder="料金"
          >

          <span>
            円
          </span>

        </div>


      </div>

    `;

  }


  routeCosts.innerHTML =
    html;

}


/* ==================================================
   区間料金取得
================================================== */

function getRouteCosts() {

  const inputs =
    document.querySelectorAll(
      ".route-cost-input"
    );


  return Array.from(
    inputs
  )

    .map(
      input => {

        return {

          from:
            input.dataset.from,

          to:
            input.dataset.to,

          cost:
            Number(
              input.value
            ) || 0

        };

      }
    );

}


/* ==================================================
   申請送信
================================================== */

async function handleSubmit(
  event
) {

  event.preventDefault();


  if (!currentUser) {

    alert(
      "ログインしてください。"
    );

    return;

  }


  if (
    confirmCheckbox &&
    !confirmCheckbox.checked
  ) {

    alert(
      "入力内容を確認してチェックを入れてください。"
    );

    return;

  }


  const viaPointValues =
    getViaPoints();


  const viaPointText =
    viaPointValues.join(
      " → "
    );


  const cost =
    Number(
      transportCost.value
    ) || 0;


  const data = {

    action:
      "submit",


    userId:
      currentUser.id,


    name:
      nameInput.value.trim(),


    grade:
      grade.value,


    className:
      className.value,


    tripDate:
      tripDate.value,


    destination:
      destination.value.trim(),


    eventName:
      eventName.value.trim(),


    departure:
      departure.value.trim(),


    viaPoints:
      viaPointText,


    arrival:
      arrival.value.trim(),


    /*
     * 区間料金
     *
     * 記録用
     * 合計金額には含めない
     */

    routeCosts:
      getRouteCosts(),


    /*
     * 実際の申請金額
     */

    transportCost:
      cost,


    totalAmount:
      cost,


    note:
      note.value.trim()

  };


  submitButton.disabled =
    true;


  submitButton.textContent =
    "送信中...";


  try {

    const result =
      await apiRequest(
        data
      );


    applicationNumber.textContent =
      result.applicationNumber;


    hideAllScreens();


    successScreen.classList.remove(
      "hidden"
    );


    expenseForm.reset();

    clearViaPoints();

    updateTotal();

    updateRouteCosts();


  } catch (error) {

    console.error(error);


    alert(
      error.message ||
      "申請に失敗しました。"
    );


  } finally {

    submitButton.disabled =
      false;


    submitButton.textContent =
      "交通費を申請する";

  }

}


/* ==================================================
   生徒：申請履歴
================================================== */

async function loadStudentApplications() {

  if (!currentUser) {

    return;

  }


  if (!studentApplications) {

    return;

  }


  studentApplications.innerHTML =
    `
    <div class="loading">
      読み込み中...
    </div>
    `;


  try {

    const result =
      await apiRequest({

        action:
          "getMyApplications",

        userId:
          currentUser.id

      });


    renderStudentApplications(
      result.applications || []
    );


  } catch (error) {

    console.error(error);


    studentApplications.innerHTML =
      `
      <div class="message error-message">

        ${escapeHtml(
          error.message
        )}

      </div>
      `;

  }

}


/* ==================================================
   生徒：申請表示
================================================== */

function renderStudentApplications(
  applications
) {

  if (
    !applications ||
    applications.length === 0
  ) {

    studentApplications.innerHTML =
      `
      <div class="empty-message">

        まだ申請はありません。

      </div>
      `;

    return;

  }


  studentApplications.innerHTML =
    applications
      .map(
        app =>
          createApplicationCard(
            app,
            false
          )
      )
      .join("");

}


/* ==================================================
   教員：全申請
================================================== */

async function loadTeacherApplications() {

  if (!currentUser) {

    return;

  }


  if (
    currentUser.role !== "教員"
  ) {

    return;

  }


  if (!teacherApplications) {

    return;

  }


  teacherApplications.innerHTML =
    `
    <div class="loading">
      読み込み中...
    </div>
    `;


  try {

    const result =
      await apiRequest({

        action:
          "getAllApplications",

        userId:
          currentUser.id

      });


    renderTeacherApplications(
      result.applications || []
    );


  } catch (error) {

    console.error(error);


    teacherApplications.innerHTML =
      `
      <div class="message error-message">

        ${escapeHtml(
          error.message
        )}

      </div>
      `;

  }

}


/* ==================================================
   教員：申請表示
================================================== */

function renderTeacherApplications(
  applications
) {

  if (
    !applications ||
    applications.length === 0
  ) {

    teacherApplications.innerHTML =
      `
      <div class="empty-message">

        申請はありません。

      </div>
      `;

    return;

  }


  teacherApplications.innerHTML =
    applications
      .map(
        app =>
          createApplicationCard(
            app,
            true
          )
      )
      .join("");

}


/* ==================================================
   申請カード
================================================== */

function createApplicationCard(
  app,
  isTeacher
) {

  const status =
    app.status ||
    "未確認";


  const statusClass =
    `status-${status}`;


  /*
   * 経由地
   */

  const viaHtml =
    app.viaPoints
      ? `
        <p>

          <strong>
            経由地：
          </strong>

          ${escapeHtml(
            app.viaPoints
          )}

        </p>
      `
      : "";


  /*
   * 区間料金
   */

  let routeCostsHtml =
    "";


  if (
    app.routeCosts &&
    app.routeCosts.length > 0
  ) {

    routeCostsHtml = `

      <p>

        <strong>
          区間料金：
        </strong>

        <br>

        ${app.routeCosts
          .map(
            route => `
              ${escapeHtml(
                route.from
              )}
              →
              ${escapeHtml(
                route.to
              )}
              ：
              ¥${Number(
                route.cost || 0
              ).toLocaleString()}
              <br>
            `
          )
          .join("")}

      </p>

    `;

  }


  /*
   * 教員用ステータス
   */

  const teacherStatusHtml =
    isTeacher
      ? `

        <p>

          <strong>
            ステータス：
          </strong>


          <select
            class="status-select"
            onchange="
              changeStatus(
                '${escapeHtml(
                  app.applicationNumber
                )}',
                this.value
              )
            "
          >

            <option
              value="未確認"
              ${
                status === "未確認"
                  ? "selected"
                  : ""
              }
            >
              未確認
            </option>


            <option
              value="確認中"
              ${
                status === "確認中"
                  ? "selected"
                  : ""
              }
            >
              確認中
            </option>


            <option
              value="承認"
              ${
                status === "承認"
                  ? "selected"
                  : ""
              }
            >
              承認
            </option>


            <option
              value="差し戻し"
              ${
                status === "差し戻し"
                  ? "selected"
                  : ""
              }
            >
              差し戻し
            </option>


            <option
              value="支払済"
              ${
                status === "支払済"
                  ? "selected"
                  : ""
              }
            >
              支払済
            </option>

          </select>

        </p>

      `
      : `

        <p>

          <strong>
            ステータス：
          </strong>


          <span
            class="status ${statusClass}"
          >
            ${escapeHtml(
              status
            )}
          </span>

        </p>

      `;


  return `

    <div
      class="
        application-card
        ${
          isTeacher
            ? "teacher-application"
            : ""
        }
      "
    >


      <div class="application-header">

        <span class="application-number">

          ${escapeHtml(
            app.applicationNumber
          )}

        </span>


        <span class="application-date">

          ${escapeHtml(
            app.tripDate || ""
          )}

        </span>

      </div>



      <div class="application-info">


        ${
          isTeacher
            ? `

              <p>

                <strong>
                  申請者：
                </strong>

                ${escapeHtml(
                  app.name || ""
                )}

              </p>


              <p>

                <strong>
                  学年：
                </strong>

                ${escapeHtml(
                  app.grade || ""
                )}

              </p>


              <p>

                <strong>
                  クラス：
                </strong>

                ${escapeHtml(
                  app.className || ""
                )}

              </p>

            `
            : ""
        }


        <p>

          <strong>
            遠征先：
          </strong>

          ${escapeHtml(
            app.destination || ""
          )}

        </p>


        <p>

          <strong>
            大会・イベント：
          </strong>

          ${escapeHtml(
            app.eventName || ""
          )}

        </p>


        <p>

          <strong>
            出発地：
          </strong>

          ${escapeHtml(
            app.departure || ""
          )}

        </p>


        ${viaHtml}


        <p>

          <strong>
            到着地：
          </strong>

          ${escapeHtml(
            app.arrival || ""
          )}

        </p>


        ${routeCostsHtml}


        <p>

          <strong>
            交通費：
          </strong>

          ¥${Number(
            app.transportCost || 0
          ).toLocaleString()}

        </p>


        <p>

          <strong>
            合計金額：
          </strong>

          ¥${Number(
            app.totalAmount || 0
          ).toLocaleString()}

        </p>


        ${
          app.note
            ? `

              <p>

                <strong>
                  備考：
                </strong>

                ${escapeHtml(
                  app.note
                )}

              </p>

            `
            : ""
        }


        ${teacherStatusHtml}


      </div>

    </div>

  `;

}


/* ==================================================
   ステータス変更
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
      "教員のみ変更できます。"
    );

    return;

  }


  try {

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


    await loadTeacherApplications();


  } catch (error) {

    console.error(error);


    alert(
      error.message ||
      "ステータス変更に失敗しました。"
    );


    await loadTeacherApplications();

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

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
