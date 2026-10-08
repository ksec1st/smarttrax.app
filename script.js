/* ==================================================
   交通費申請システム
   写真・Google Drive保存なし
   交通手段・利用区分・その他交通費なし
================================================== */


/* ==================================================
   Google Apps Script URL
================================================== */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzdXE9K8JGJJCQ5cG1k7r4MxBPh6xIyDh4FFFYhzCi7PUS9euHPlSFkOnptJLrn8n83pw/exec";


/* ==================================================
   要素取得
================================================== */

const form =
  document.getElementById("expenseForm");

const transportCost =
  document.getElementById("transportCost");

const totalAmount =
  document.getElementById("totalAmount");

const submitButton =
  document.getElementById("submitButton");

const successScreen =
  document.getElementById("successScreen");

const applicationNumber =
  document.getElementById("applicationNumber");

const newApplication =
  document.getElementById("newApplication");


/* ==================================================
   合計金額
================================================== */

function calculateTotal() {

  const total =
    Number(transportCost.value) || 0;

  totalAmount.textContent =
    total.toLocaleString("ja-JP");
}


/* ==================================================
   金額入力時
================================================== */

transportCost.addEventListener(
  "input",
  calculateTotal
);


/* ==================================================
   フォーム送信
================================================== */

form.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    /* ----------------------------------------------
       GAS URLチェック
    ---------------------------------------------- */

    if (
      !GAS_URL ||
      GAS_URL.includes(
        "ここにApps Script"
      )
    ) {

      alert(
        "Apps ScriptのURLが設定されていません。"
      );

      return;
    }


    /* ----------------------------------------------
       送信ボタン無効化
    ---------------------------------------------- */

    submitButton.disabled = true;

    submitButton.querySelector(
      "span"
    ).textContent = "送信中...";


    /* ----------------------------------------------
       入力データ取得
    ---------------------------------------------- */

    const data = {

      name:
        document
          .getElementById("name")
          .value
          .trim(),

      grade:
        document
          .getElementById("grade")
          .value,

      className:
        document
          .getElementById("className")
          .value
          .trim(),

      tripDate:
        document
          .getElementById("tripDate")
          .value,

      destination:
        document
          .getElementById("destination")
          .value
          .trim(),

      eventName:
        document
          .getElementById("eventName")
          .value
          .trim(),

      departure:
        document
          .getElementById("departure")
          .value
          .trim(),

      arrival:
        document
          .getElementById("arrival")
          .value
          .trim(),

      transportCost:
        Number(
          transportCost.value
        ) || 0,

      totalAmount:
        Number(
          transportCost.value
        ) || 0,

      note:
        document
          .getElementById("note")
          .value
          .trim()

    };


    /* ----------------------------------------------
       Google Apps Scriptへ送信
    ---------------------------------------------- */

    try {

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


      /* --------------------------------------------
         JSON取得
      -------------------------------------------- */

      const result =
        await response.json();


      /* --------------------------------------------
         成功
      -------------------------------------------- */

      if (result.success) {

        applicationNumber.textContent =
          result.applicationNumber;

        form.style.display =
          "none";

        successScreen.style.display =
          "block";

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }


      /* --------------------------------------------
         エラー
      -------------------------------------------- */

      else {

        alert(
          result.message ||
          "申請の送信に失敗しました。"
        );

      }

    }


    catch (error) {

      console.error(error);

      alert(
        "通信エラーが発生しました。\n\n" +
        "時間をおいてもう一度お試しください。"
      );

    }


    finally {

      submitButton.disabled =
        false;

      submitButton.querySelector(
        "span"
      ).textContent =
        "交通費を申請する";

    }

  }
);


/* ==================================================
   新しい申請
================================================== */

newApplication.addEventListener(
  "click",
  function() {

    form.reset();

    calculateTotal();

    successScreen.style.display =
      "none";

    form.style.display =
      "block";

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


/* ==================================================
   初期表示
================================================== */

calculateTotal();
