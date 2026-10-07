const GAS_URL =
  "ここにApps ScriptのウェブアプリURLを貼り付け";


// ======================================================
// ELEMENTS
// ======================================================

const form =
  document.getElementById("expenseForm");

const submitButton =
  document.getElementById("submitButton");

const transportCost =
  document.getElementById("transportCost");

const otherCost =
  document.getElementById("otherCost");

const totalAmount =
  document.getElementById("totalAmount");

const receipt =
  document.getElementById("receipt");

const preview =
  document.getElementById("preview");

const successScreen =
  document.getElementById("successScreen");

const applicationNumber =
  document.getElementById("applicationNumber");

const newApplication =
  document.getElementById("newApplication");


// ======================================================
// 合計金額
// ======================================================

function calculateTotal() {

  const transport =
    Number(transportCost.value) || 0;

  const other =
    Number(otherCost.value) || 0;

  const total =
    transport + other;

  totalAmount.textContent =
    "¥" + total.toLocaleString("ja-JP");
}


transportCost.addEventListener(
  "input",
  calculateTotal
);

otherCost.addEventListener(
  "input",
  calculateTotal
);


// ======================================================
// 写真プレビュー
// ======================================================

receipt.addEventListener(
  "change",
  function () {

    preview.innerHTML = "";

    const file =
      this.files[0];

    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];


    if (
      !allowedTypes.includes(file.type)
    ) {

      alert(
        "JPG・PNG・WEBP形式の画像を選択してください。"
      );

      this.value = "";

      return;
    }


    // 10MB制限

    if (
      file.size >
      10 * 1024 * 1024
    ) {

      alert(
        "写真のサイズは10MB以下にしてください。"
      );

      this.value = "";

      return;
    }


    const reader =
      new FileReader();


    reader.onload =
      function (event) {

        const img =
          document.createElement("img");

        img.src =
          event.target.result;

        img.alt =
          "領収書プレビュー";

        preview.appendChild(img);

      };


    reader.readAsDataURL(file);

  }
);


// ======================================================
// フォーム送信
// ======================================================

form.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    // Apps Script URLチェック

    if (
      !GAS_URL ||
      GAS_URL.includes(
        "ここにApps Script"
      )
    ) {

      alert(
        "Apps ScriptのURLが設定されていません。\n\n" +
        "script.jsのGAS_URLを設定してください。"
      );

      return;
    }


    // 二重送信防止

    submitButton.disabled = true;

    submitButton
      .querySelector(
        "span:first-child"
      )
      .textContent =
      "送信中...";


    try {

      const file =
        receipt.files[0];


      // ==================================================
      // 写真をBase64化
      // ==================================================

      let fileData = "";

      let fileName = "";

      let fileType = "";


      if (file) {

        fileData =
          await fileToBase64(file);

        fileName =
          file.name;

        fileType =
          file.type;

      }


      // ==================================================
      // 金額
      // ==================================================

      const transport =
        Number(
          transportCost.value
        ) || 0;

      const other =
        Number(
          otherCost.value
        ) || 0;

      const total =
        transport + other;


      // ==================================================
      // 送信データ
      // ==================================================

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

        transport:
          document
            .getElementById("transport")
            .value,

        roundTrip:
          document
            .getElementById("roundTrip")
            .value,

        transportCost:
          transport,

        otherCost:
          other,

        totalAmount:
          total,

        note:
          document
            .getElementById("note")
            .value
            .trim(),

        fileData:
          fileData,

        fileName:
          fileName,

        fileType:
          fileType

      };


      // ==================================================
      // Apps Scriptへ送信
      // ==================================================

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


      // ==================================================
      // 成功
      // ==================================================

      if (result.success) {

        applicationNumber.textContent =
          result.applicationNumber;


        form.classList.add(
          "hidden"
        );


        successScreen.classList.remove(
          "hidden"
        );


        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }

      // ==================================================
      // エラー
      // ==================================================

      else {

        throw new Error(
          result.message ||
          "申請処理に失敗しました。"
        );

      }


    } catch (error) {

      console.error(error);


      alert(
        "申請の送信に失敗しました。\n\n" +
        "時間をおいてもう一度お試しください。\n\n" +
        "エラー：" +
        error.message
      );


    } finally {

      submitButton.disabled =
        false;


      submitButton
        .querySelector(
          "span:first-child"
        )
        .textContent =
        "交通費を申請する";

    }

  }
);


// ======================================================
// File → Base64
// ======================================================

function fileToBase64(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const result =
            reader.result;


          const base64 =
            result.split(",")[1];


          resolve(base64);

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "写真の読み込みに失敗しました。"
            )
          );

        };


      reader.readAsDataURL(file);

    }
  );

}


// ======================================================
// 新しい申請
// ======================================================

newApplication.addEventListener(
  "click",
  function () {

    form.reset();

    preview.innerHTML = "";

    calculateTotal();


    successScreen.classList.add(
      "hidden"
    );


    form.classList.remove(
      "hidden"
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


// ======================================================
// 初期化
// ======================================================

calculateTotal();
```
