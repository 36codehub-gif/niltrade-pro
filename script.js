
let services = [
  {
    code: "DEMO001",
    name: "Demo Consultation Service",
    rate: 500,
    unit: 1
  },
  {
    code: "DEMO002",
    name: "Demo Imaging Service",
    rate: 400,
    unit: 1
  }
];

const $ = id => document.getElementById(id);

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function addItem() {
  services.push({
    code: "DEMO",
    name: "New Demo Service",
    rate: 0,
    unit: 1
  });

  renderEditor();
  updateReceipt();
}

function renderEditor() {
  const container = $("itemsEditor");
  container.innerHTML = "";

  services.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-editor";

    const fields = [
      ["name", "Description", "text"],
      ["code", "Code", "text"],
      ["rate", "Rate", "number"],
      ["unit", "Unit", "number"]
    ];

    fields.forEach(([key, placeholder, type]) => {
      const input = document.createElement("input");
      input.type = type;
      input.placeholder = placeholder;
      input.value = item[key];

      if (type === "number") {
        input.min = "0";
      }

      input.addEventListener("input", () => {
        services[index][key] =
          type === "number"
            ? Math.max(0, Number(input.value) || 0)
            : input.value;

        updateReceipt();
      });

      row.appendChild(input);
    });

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "X";

    remove.onclick = () => {
      services.splice(index, 1);
      renderEditor();
      updateReceipt();
    };

    row.appendChild(remove);
    container.appendChild(row);
  });
}

function numberToWords(num) {
  const ones = [
    "", "One", "Two", "Three", "Four",
    "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen",
    "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convert(n) {
    if (n < 20) return ones[n];

    if (n < 100) {
      return tens[Math.floor(n / 10)] +
        (n % 10 ? " " + ones[n % 10] : "");
    }

    if (n < 1000) {
      return ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "");
    }

    if (n < 100000) {
      return convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "");
    }

    if (n < 10000000) {
      return convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "");
    }

    return "Amount exceeds demo converter limit";
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  return convert(rupees) + " Rupees" +
    (paise ? " and " + convert(paise) + " Paise" : "") +
    " Only";
}

function updateReceipt() {
  const mapping = {
    hospital: "pHospital",
    hospitalAddress: "pHospitalAddress",
    hospitalPhone: "pHospitalPhone",
    hospitalEmail: "pHospitalEmail",
    uhid: "pUhid",
    billNo: "pBillNo",
    visitNo: "pVisit",
    patient: "pPatient",
    genderAge: "pGender",
    contact: "pContact",
    patientAddress: "pAddress",
    labNo: "pLab",
    doctor: "pDoctor",
    department: "pDepartment",
    payer: "pPayer",
    prepared: "pPrepared",
    payment: "pPayment"
  };

  Object.entries(mapping).forEach(([inputId, outputId]) => {
    $(outputId).textContent = $(inputId).value;
  });

  const dateValue = $("billDate").value;

  $("pBillDate").textContent = dateValue
    ? new Date(dateValue).toLocaleString("en-IN")
    : "";

  let gross = 0;

  $("receiptItems").innerHTML = "";

  services.forEach((item, index) => {
    const total = item.rate * item.unit;
    gross += total;

    const row = document.createElement("tr");

    const values = [
      index + 1,
      item.code,
      item.name,
      money(item.rate),
      item.unit,
      money(total),
      money(total),
      money(total),
      money(0)
    ];

    values.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    $("receiptItems").appendChild(row);
  });

  const discount = Math.max(
    0,
    Number($("discount").value) || 0
  );

  const net = Math.max(0, gross - discount);

  $("gross").textContent = money(gross);
  $("net").textContent = money(net);
  $("payerAmount").textContent = money(0);
  $("patientAmount").textContent = money(net);
  $("received").textContent = money(net);

  $("words").textContent = numberToWords(net);
}

// Update automatically when details change
document.querySelectorAll(
  ".editor input, .editor textarea, .editor select"
).forEach(input => {
  input.addEventListener("input", updateReceipt);
  input.addEventListener("change", updateReceipt);
});

// Initial setup
$("billDate").value = new Date().toISOString().slice(0, 16);

renderEditor();
updateReceipt();
