export const downloadContent = async (filename: string, content: string) => {
  try {
    // Feature detection for File System Access API
    // @ts-ignore
    if (window.showSaveFilePicker) {
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Text File",
            accept: {
              "text/plain": [".txt"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.warn("Save File Picker failed, falling back to download.", err);
    } else {
        return; // User cancelled
    }
  }

  const blob = new Blob([content], { type: "text/plain" });
  const urlObj = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = urlObj;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(urlObj);
  document.body.removeChild(a);
};
