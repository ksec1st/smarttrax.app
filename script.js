/* ==================================================
   SmartTrax
================================================== */


/* ==================================================
   設定
================================================== */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzdXE9K8JGJJCQ5cG1k7r4MxBPh6xIyDh4FFFYhzCi7PUS9euHPlSFkOnptJLrn8n83pw/exec";


/* ==================================================
   状態
================================================== */

let currentUser = null;

let viaPoints = [];


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
   API
================================================== */

async function api(data) {

  const response =
    await fetch(GAS_URL, {

      method: "POST",

      headers: {
        "Content-Type":
          "text/plain;charset=utf-8"
      },

      body: JSON.stringify(data)

    });


  return await response.json();

}


/* ==================================================
   画面切替
================================================== */

function showScreen(screen) {

  loginScreen.classList.add("hidden");

  studentScreen.classList.add("hidden");

  teacherScreen.classList.add("hidden");

  successScreen.classList.add("hidden");


  screen.classList.remove("hidden");

}


/* ==================================================
   ログイン
================================================== */

document
  .getElementById("loginForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const loginId =
        document
          .getElementById("loginId")
          .value
          .trim();


      const message =
        document.getElementById(
          "loginMessage"
        );


      message.textContent =
        "ログインしています…";


      try {

        const result =
          await api({

            action: "login",

            userId: loginId

          });


        if (!result.success) {

          message.textContent =
            result.message;

          return;

        }


        currentUser =
          result.user;


        logoutButton
          .classList
          .remove("hidden");


        if (
          currentUser.role === "教員"
        ) {

          document
            .getElementById("teacherName")
            .textContent =
              currentUser.name +
              " さん";


          showScreen(
            teacherScreen
          );


          loadTeacherApplications();

          loadStudents();


        } else {


          document
            .getElementById("studentName")
            .textContent =
              currentUser.name +
              " さん";


          document
            .getElementById("name")
            .value =
              currentUser.name;


          document
            .getElementById("grade")
            .value =
              currentUser.grade;


          showScreen(
            studentScreen
          );


          updateSegmentFees();

          loadMyApplications();

        }


      } catch (error) {

        console.error(error);

        message.textContent =
          "通信エラーが発生しました。";

      }

    }
  );


/* ==================================================
   ログアウト
================================================== */

logoutButton.addEventListener(
  "click",
  function() {

    currentUser = null;

    logoutButton
      .classList
      .add("hidden");

    document
      .getElementById("loginId")
      .value = "";

    showScreen(loginScreen);

  }
);


/* ==================================================
   経由地追加
================================================== */

document
  .getElementById("addViaButton")
  .addEventListener(
    "click",
    function() {

      viaPoints.push("");

      renderViaPoints();

      updateSegmentFees();

    }
  );


/* ==================================================
   経由地表示
================================================== */

function renderViaPoints() {

  const container =
    document.getElementById(
      "viaContainer"
    );


  container.innerHTML = "";


  if (viaPoints.length === 0) {

    return;

  }


  const label =
    document.createElement("label");

  label.textContent =
    "経由地";

  container.appendChild(label);


  viaPoints.forEach(
    function(point, index) {

      const row =
        document.createElement("div");

      row.className =
        "via-row";


      const input =
        document.createElement("input");

      input.type = "text";

      input.placeholder =
        "例：中書島駅";

      input.value =
        point;


      input.addEventListener(
        "input",
        function() {

          viaPoints[index] =
            input.value;

          updateSegmentFees();

        }
      );


      const remove =
        document.createElement("button");

      remove.type = "button";

      remove.className =
        "remove-via";

      remove.textContent =
        "×";


      remove.addEventListener(
        "click",
        function() {

          viaPoints.splice(
            index,
            1
          );

          renderViaPoints();

          updateSegmentFees();

        }
      );


      row.appendChild(input);

      row.appendChild(remove);

      container.appendChild(row);

    }
  );

}


/* ==================================================
   区間取得
================================================== */

function getRoutePoints() {

  const departure =
    document
      .getElementById("departure")
      .value
      .trim();


  const arrival =
    document
      .getElementById("arrival")
      .value
      .trim();


  const points = [];


  if (departure) {
    points.push(departure);
  }


  viaPoints.forEach(
    function(point) {

      if (point.trim()) {

        points.push(
          point.trim()
        );

      }

    }
  );


  if (arrival) {
    points.push(arrival);
  }


  return points;

}


/* ==================================================
   区間料金UI
================================================== */

function updateSegmentFees() {

  const container =
    document.getElementById(
      "segmentFeeContainer"
    );


  const points =
    getRoutePoints();


  container.innerHTML = "";


  if (points.length < 2) {

    return;

  }


  const title =
    document.createElement("label");

  title.textContent =
    "各区間料金";

  container.appendChild(title);


  const note =
    document.createElement("div");

  note.className =
    "student-note";

  note.textContent =
    "各区間料金は記録用です。合計金額には含まれません。";

  container.appendChild(note);


  const list =
    document.createElement("div");

  list.className =
    "segment-fee-list";


  for (
    let i = 0;
    i < points.length - 1;
    i++
  ) {

    const item =
      document.createElement("div");

    item.className =
      "segment-fee-item";


    const label =
      document.createElement("div");

    label.className =
      "segment-label";

    label.textContent =
      points[i] +
      " → " +
      points[i + 1];


    const money =
      document.createElement("div");

    money.className =
      "money-input";


    const input =
      document.createElement("input");

    input.type = "number";

    input.min = "0";

    input.step = "1";

    input.placeholder = "0";

    input.className =
      "segment-fee-input";


    const yen =
      document.createElement("span");

    yen.textContent =
      "円";


    money.appendChild(input);

    money.appendChild(yen);


    item.appendChild(label);

    item.appendChild(money);


    list.appendChild(item);

  }


  container.appendChild(list);

}


/* ==================================================
   出発地・到着地変更
================================================== */

document
  .getElementById("departure")
  .addEventListener(
    "input",
    updateSegmentFees
  );


document
  .getElementById("arrival")
  .addEventListener(
    "input",
    updateSegmentFees
  );


/* ==================================================
   交通費 → 合計金額
================================================== */

document
  .getElementById("transportCost")
  .addEventListener(
    "input",
    function() {

      const value =
        Number(this.value) || 0;


      document
        .getElementById(
          "totalAmount"
        )
        .textContent =
        value.toLocaleString();

    }
  );


/* ==================================================
   申請
================================================== */

document
  .getElementById("expenseForm")
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      if (!currentUser) {

        alert(
          "ログイン情報がありません。"
        );

        return;

      }


      const confirm =
        document
          .getElementById("confirm")
          .checked;


      if (!confirm) {

        alert(
          "入力内容を確認してください。"
        );

        return;

      }


      const button =
        document
          .getElementById(
            "submitButton"
          );


      button.disabled = true;

      button.textContent =
        "送信中…";


      try {


        /* 区間料金 */

        const feeInputs =
          document.querySelectorAll(
            ".segment-fee-input"
          );


        const segmentFees =
          Array.from(
            feeInputs
          ).map(
            function(input) {

              return input.value || "";

            }
          );


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

          viaPoints:
            viaPoints,

          arrival:
            document
              .getElementById("arrival")
              .value,

          segmentFees:
            segmentFees,

          transportCost:
            document
              .getElementById(
                "transportCost"
              )
              .value,

          note:
            document
              .getElementById("note")
              .value

        };


        const result =
          await api(data);


        if (!result.success) {

          alert(
            result.message
          );

          return;

        }


        document
          .getElementById(
            "applicationNumber"
          )
          .textContent =
          result.applicationNumber;


        showScreen(
          successScreen
        );


      } catch (error) {

        console.error(error);

        alert(
          "送信中にエラーが発生しました。"
        );

      } finally {

        button.disabled = false;

        button.textContent =
          "申請する";

      }

    }
  );


/* ==================================================
   新しい申請
================================================== */

document
  .getElementById("newApplication")
  .addEventListener(
    "click",
    function() {

      document
        .getElementById(
          "expenseForm"
        )
        .reset();


      document
        .getElementById("name")
        .value =
        currentUser.name;


      document
        .getElementById("grade")
        .value =
        currentUser.grade;


      viaPoints = [];

      renderViaPoints();

      updateSegmentFees();


      document
        .getElementById(
          "totalAmount"
        )
        .textContent =
        "0";


      showScreen(
        studentScreen
      );

    }
  );


/* ==================================================
   自分の申請
================================================== */

async function loadMyApplications() {

  const container =
    document.getElementById(
      "studentApplications"
    );


  container.innerHTML =
    `<p class="empty-message">
      読み込んでいます…
    </p>`;


  try {

    const result =
      await api({

        action:
          "getMyApplications",

        userId:
          currentUser.id

      });


    if (!result.success) {

      container.innerHTML =
        `<p class="empty-message">
          ${result.message}
        </p>`;

      return;

    }


    if (
      !result.applications ||
      result.applications.length === 0
    ) {

      container.innerHTML =
        `<p class="empty-message">
          まだ申請はありません。
        </p>`;

      return;

    }


    container.innerHTML =
      result.applications
        .map(
          renderStudentApplication
        )
        .join("");


  } catch (error) {

    console.error(error);

    container.innerHTML =
      `<p class="empty-message">
        読み込みに失敗しました。
      </p>`;

  }

}


function renderStudentApplication(app) {

  return `

    <div class="application-item">

      <div class="application-top">

        <div class="application-number">
          ${escapeHtml(app.applicationNumber)}
        </div>

        <div>
          ${escapeHtml(app.status)}
        </div>

      </div>


      <div class="application-detail">

        <div>
          <div class="detail-label">
            遠征日
          </div>

          <div class="detail-value">
            ${escapeHtml(app.tripDate)}
          </div>
        </div>


        <div>
          <div class="detail-label">
            遠征先
          </div>

          <div class="detail-value">
            ${escapeHtml(app.destination)}
          </div>
        </div>


        <div>
          <div class="detail-label">
            大会・イベント
          </div>

          <div class="detail-value">
            ${escapeHtml(app.eventName)}
          </div>
        </div>


        <div>
          <div class="detail-label">
            交通費
          </div>

          <div class="detail-value">
            ${Number(app.transportCost).toLocaleString()}円
          </div>
        </div>


        <div>
          <div class="detail-label">
            合計金額
          </div>

          <div class="detail-value">
            ${Number(app.totalAmount).toLocaleString()}円
          </div>
        </div>

      </div>

    </div>

  `;

}


/* ==================================================
   生徒申請更新
================================================== */

document
  .getElementById(
    "refreshStudentButton"
  )
  .addEventListener(
    "click",
    loadMyApplications
  );


/* ==================================================
   教員：申請一覧
================================================== */

async function loadTeacherApplications() {

  const container =
    document.getElementById(
      "teacherApplications"
    );


  container.innerHTML =
    `<p class="empty-message">
      読み込んでいます…
    </p>`;


  try {

    const result =
      await api({

        action:
          "getAllApplications",

        userId:
          currentUser.id

      });


    if (!result.success) {

      container.innerHTML =
        `<p class="empty-message">
          ${result.message}
        </p>`;

      return;

    }


    if (
      !result.applications ||
      result.applications.length === 0
    ) {

      container.innerHTML =
        `<p class="empty-message">
          申請はありません。
        </p>`;

      return;

    }


    container.innerHTML =
      result.applications
        .map(
          renderTeacherApplication
        )
        .join("");


    attachStatusEvents();


  } catch (error) {

    console.error(error);

    container.innerHTML =
      `<p class="empty-message">
        読み込みに失敗しました。
      </p>`;

  }

}


/* ==================================================
   教員：申請表示
================================================== */

function renderTeacherApplication(app) {

  const via =
    app.viaPoints
      ? app.viaPoints
          .split("\n")
          .filter(Boolean)
      : [];


  const fees =
    app.segmentFees
      ? app.segmentFees
          .split("\n")
          .filter(Boolean)
      : [];


  const routePoints = [

    app.departure,

    ...via,

    app.arrival

  ];


  let feeHtml = "";


  for (
    let i = 0;
    i < fees.length;
    i++
  ) {

    const from =
      routePoints[i] || "";

    const to =
      routePoints[i + 1] || "";


    feeHtml += `

      <div class="segment-fee-row">

        <span>
          ${escapeHtml(from)}
          →
          ${escapeHtml(to)}
        </span>

        <strong>
          ${escapeHtml(fees[i])}
        </strong>

      </div>

    `;

  }


  return `

    <div class="teacher-application">

      <div class="application-top">

        <div>

          <div class="application-number">

            ${escapeHtml(
              app.applicationNumber
            )}

          </div>

          <strong>

            ${escapeHtml(app.name)}

          </strong>

          <span>

            ${escapeHtml(app.grade)}
            ${escapeHtml(app.className)}

          </span>

        </div>


        <div>

          ${escapeHtml(app.submittedAt)}

        </div>

      </div>


      <div class="application-detail">

        <div>

          <div class="detail-label">
            遠征日
          </div>

          <div class="detail-value">
            ${escapeHtml(app.tripDate)}
          </div>

        </div>


        <div>

          <div class="detail-label">
            遠征先
          </div>

          <div class="detail-value">
            ${escapeHtml(app.destination)}
          </div>

        </div>


        <div>

          <div class="detail-label">
            大会・イベント
          </div>

          <div class="detail-value">
            ${escapeHtml(app.eventName)}
          </div>

        </div>


        <div>

          <div class="detail-label">
            交通費
          </div>

          <div class="detail-value">
            ${Number(app.transportCost).toLocaleString()}円
          </div>

        </div>


        <div>

          <div class="detail-label">
            合計金額
          </div>

          <div class="detail-value">
            ${Number(app.totalAmount).toLocaleString()}円
          </div>

        </div>

      </div>


      <div class="teacher-route">

        <strong>
          経路
        </strong>

        <p>

          ${escapeHtml(app.departure)}

          ${via.length
            ? " → " +
              via
                .map(escapeHtml)
                .join(" → ")
            : ""}

          → 

          ${escapeHtml(app.arrival)}

        </p>


        <div class="teacher-segment-fees">

          <strong>
            各区間料金
          </strong>

          ${feeHtml || `
            <p>
              区間料金なし
            </p>
          `}

        </div>

      </div>


      ${
        app.note
          ? `
            <div class="teacher-route">

              <strong>
                備考
              </strong>

              <p>
                ${escapeHtml(app.note)}
              </p>

            </div>
          `
          : ""
      }


      <div class="status-row">

        <select
          class="status-select"
          data-application="${escapeHtml(
            app.applicationNumber
          )}">

          <option
            value="未確認"
            ${
              app.status === "未確認"
                ? "selected"
                : ""
            }>
            未確認
          </option>

          <option
            value="確認中"
            ${
              app.status === "確認中"
                ? "selected"
                : ""
            }>
            確認中
          </option>

          <option
            value="承認"
            ${
              app.status === "承認"
                ? "selected"
                : ""
            }>
            承認
          </option>

          <option
            value="差し戻し"
            ${
              app.status === "差し戻し"
                ? "selected"
                : ""
            }>
            差し戻し
          </option>

          <option
            value="支払済"
            ${
              app.status === "支払済"
                ? "selected"
                : ""
            }>
            支払済
          </option>

        </select>


        <button
          class="status-button"
          data-application="${escapeHtml(
            app.applicationNumber
          )}">

          更新

        </button>

      </div>

    </div>

  `;

}


/* ==================================================
   ステータス更新イベント
================================================== */

function attachStatusEvents() {

  document
    .querySelectorAll(
      ".status-button"
    )
    .forEach(
      function(button) {

        button.addEventListener(
          "click",
          async function() {

            const applicationNumber =
              button.dataset.application;


            const select =
              document.querySelector(
                `.status-select[data-application="${CSS.escape(applicationNumber)}"]`
              );


            const status =
              select.value;


            button.disabled = true;

            button.textContent =
              "更新中…";


            try {

              const result =
                await api({

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

                alert(
                  result.message
                );

                return;

              }


              await loadTeacherApplications();


            } catch (error) {

              console.error(error);

              alert(
                "更新に失敗しました。"
              );

            } finally {

              button.disabled = false;

              button.textContent =
                "更新";

            }

          }
        );

      }
    );

}


/* ==================================================
   教員：申請更新
================================================== */

document
  .getElementById(
    "refreshTeacherButton"
  )
  .addEventListener(
    "click",
    loadTeacherApplications
  );


/* ==================================================
   教員：タブ
================================================== */

document
  .querySelectorAll(
    ".admin-tab"
  )
  .forEach(
    function(tab) {

      tab.addEventListener(
        "click",
        function() {

          document
            .querySelectorAll(
              ".admin-tab"
            )
            .forEach(
              function(item) {

                item.classList
                  .remove("active");

              }
            );


          document
            .querySelectorAll(
              ".admin-tab-content"
            )
            .forEach(
              function(content) {

                content.classList
                  .add("hidden");

              }
            );


          tab.classList
            .add("active");


          document
            .getElementById(
              tab.dataset.tab
            )
            .classList
            .remove("hidden");

        }
      );

    }
  );


/* ==================================================
   教員：生徒一覧
================================================== */

async function loadStudents() {

  const container =
    document.getElementById(
      "studentManagement"
    );


  container.innerHTML =
    `<p class="empty-message">
      読み込んでいます…
    </p>`;


  try {

    const result =
      await api({

        action:
          "getStudents",

        userId:
          currentUser.id

      });


    if (!result.success) {

      container.innerHTML =
        `<p class="empty-message">
          ${result.message}
        </p>`;

      return;

    }


    if (
      !result.students ||
      result.students.length === 0
    ) {

      container.innerHTML =
        `<p class="empty-message">
          登録されている生徒はいません。
        </p>`;

      return;

    }


    container.innerHTML =
      result.students
        .map(
          renderStudent
        )
        .join("");


    attachStudentEvents();


  } catch (error) {

    console.error(error);

    container.innerHTML =
      `<p class="empty-message">
        生徒一覧の取得に失敗しました。
      </p>`;

  }

}


/* ==================================================
   生徒表示
================================================== */

function renderStudent(student) {

  return `

    <div class="student-row">

      <div class="student-id">
        ${escapeHtml(student.id)}
      </div>

      <div class="student-name">
        ${escapeHtml(student.name)}
      </div>

      <div class="student-grade">
        ${escapeHtml(student.grade)}
      </div>

      <div class="student-actions">

        <button
          class="edit-button"
          data-id="${escapeHtml(student.id)}">

          編集

        </button>


        <button
          class="delete-button"
          data-id="${escapeHtml(student.id)}">

          削除

        </button>

      </div>

    </div>

  `;

}


/* ==================================================
   生徒追加ボタン
================================================== */

document
  .getElementById(
    "addStudentButton"
  )
  .addEventListener(
    "click",
    function() {

      openStudentModal();

    }
  );


/* ==================================================
   生徒イベント
================================================== */

function attachStudentEvents() {


  document
    .querySelectorAll(
      ".edit-button"
    )
    .forEach(
      function(button) {

        button.addEventListener(
          "click",
          function() {

            const id =
              button.dataset.id;


            openStudentModal(id);

          }
        );

      }
    );


  document
    .querySelectorAll(
      ".delete-button"
    )
    .forEach(
      function(button) {

        button.addEventListener(
          "click",
          async function() {

            const id =
              button.dataset.id;


            const ok =
              confirm(
                id +
                " を削除しますか？"
              );


            if (!ok) {
              return;
            }


            button.disabled = true;


            try {

              const result =
                await api({

                  action:
                    "deleteStudent",

                  userId:
                    currentUser.id,

                  studentId:
                    id

                });


              if (!result.success) {

                alert(
                  result.message
                );

                return;

              }


              await loadStudents();


            } catch (error) {

              console.error(error);

              alert(
                "削除に失敗しました。"
              );

            } finally {

              button.disabled = false;

            }

          }
        );

      }
    );

}


/* ==================================================
   生徒モーダル
================================================== */

function openStudentModal(id = "") {

  const modal =
    document.getElementById(
      "studentModal"
    );


  const title =
    document.getElementById(
      "studentModalTitle"
    );


  const idInput =
    document.getElementById(
      "studentId"
    );


  const nameInput =
    document.getElementById(
      "studentEditName"
    );


  const gradeInput =
    document.getElementById(
      "studentEditGrade"
    );


  const editingInput =
    document.getElementById(
      "editingStudentId"
    );


  if (!id) {

    title.textContent =
      "生徒を追加";


    idInput.value =
      "";

    idInput.disabled =
      false;


    nameInput.value =
      "";


    gradeInput.value =
      "";


    editingInput.value =
      "";


  } else {

    const rows =
      document
        .querySelectorAll(
          ".student-row"
        );


    let target = null;


    rows.forEach(
      function(row) {

        const edit =
          row.querySelector(
            ".edit-button"
          );


        if (
          edit &&
          edit.dataset.id === id
        ) {

          target = row;

        }

      }
    );


    if (!target) {
      return;
    }


    const name =
      target
        .querySelector(
          ".student-name"
        )
        .textContent
        .trim();


    const grade =
      target
        .querySelector(
          ".student-grade"
        )
        .textContent
        .trim();


    title.textContent =
      "生徒を編集";


    idInput.value =
      id;

    idInput.disabled =
      true;


    nameInput.value =
      name;


    gradeInput.value =
      grade;


    editingInput.value =
      id;

  }


  modal.classList
    .remove("hidden");

}


/* ==================================================
   モーダル閉じる
================================================== */

document
  .getElementById(
    "closeStudentModal"
  )
  .addEventListener(
    "click",
    closeStudentModal
  );


document
  .querySelector(
    ".modal-overlay"
  )
  .addEventListener(
    "click",
    closeStudentModal
  );


function closeStudentModal() {

  document
    .getElementById(
      "studentModal"
    )
    .classList
    .add("hidden");

}


/* ==================================================
   生徒保存
================================================== */

document
  .getElementById(
    "studentForm"
  )
  .addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const editingId =
        document
          .getElementById(
            "editingStudentId"
          )
          .value;


      const studentId =
        document
          .getElementById(
            "studentId"
          )
          .value
          .trim();


      const name =
        document
          .getElementById(
            "studentEditName"
          )
          .value
          .trim();


      const grade =
        document
          .getElementById(
            "studentEditGrade"
          )
          .value;


      if (
        !studentId ||
        !name ||
        !grade
      ) {

        alert(
          "すべて入力してください。"
        );

        return;

      }


      try {

        let result;


        if (editingId) {

          result =
            await api({

              action:
                "updateStudent",

              userId:
                currentUser.id,

              studentId:
                editingId,

              name:
                name,

              grade:
                grade

            });

        } else {

          result =
            await api({

              action:
                "addStudent",

              userId:
                currentUser.id,

              studentId:
                studentId,

              name:
                name,

              grade:
                grade

            });

        }


        if (!result.success) {

          alert(
            result.message
          );

          return;

        }


        closeStudentModal();

        await loadStudents();


      } catch (error) {

        console.error(error);

        alert(
          "保存に失敗しました。"
        );

      }

    }
  );


/* ==================================================
   HTMLエスケープ
================================================== */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
