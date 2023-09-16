export const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

export const downloadVideo = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/download");
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "userdownload.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

export const startScript = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/start", {
      method: "POST",
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error starting script:", error);
  }
};

export const stopScript = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/stop", {
      method: "POST",
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error stopping script:", error);
  }
};
