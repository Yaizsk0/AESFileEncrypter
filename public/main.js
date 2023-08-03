document
  .getElementById("encrypt-button")
  .addEventListener("click", encryptFile);
document
  .getElementById("decrypt-button")
  .addEventListener("click", decryptFile);

document.getElementById("file-input").addEventListener("change", function (e) {
  var fileName = e.target.files[0].name;
  e.target.nextElementSibling.innerText = fileName;
});

async function encryptFile() {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  // Create a new FileReader instance
  const reader = new FileReader();

  // Add an event listener for when the file read is complete
  reader.addEventListener(
    "load",
    async function () {
      // reader.result contains the contents of the file as a base64 encoded string
      const base64String = reader.result
        .replace("data:", "")
        .replace(/^.+,/, "");

      const response = await fetch("/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: file.name, fileData: base64String }),
      });

      const result = await response.text();
      document.getElementById("result").innerText = result;
      document.getElementById("copy-button").disabled = false;
    },
    false
  );

  // Start reading the file as a DataURL
  if (file) {
    reader.readAsDataURL(file);
  }
}

async function decryptFile() {
  const result = document.getElementById("result").value;
  const [, fileName, encryptedBase64] = result.split(";");
  const response = await fetch("http://localhost:3313/decrypt", {
    method: "POST",
    body: JSON.stringify({ fileName, encryptedBase64 }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Check if the response is ok (status 200-299)
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  // Get blob from response
  const blob = await response.blob();

  // Create a local URL of that blob
  const fileUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to the file URL
  link.href = fileUrl;

  // Set the download attribute of the link to the original file name
  link.download = fileName;

  // Append the link to the document body
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Remove the link from the document body
  document.body.removeChild(link);
}

function copyToClipboard() {
  const result = document.getElementById("result");
  result.select();
  document.execCommand("copy");
}
