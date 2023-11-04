import "./App.css";
import Resizer from "./resizer";
import { formats } from "./resizeFormats";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function App() {
  const resizeFile = (file, width, height, type, isRoundedImage) =>
    new Promise(async (resolve) => {
      Resizer.imageFileResizer({
        file,
        maxHeight: height,
        maxWidth: width,
        compressFormat: type,
        responseUriFunc: async (uri) => {
          resolve(uri);
        },
        outputType: "blob",
        minWidth: width,
        minHeight: height,
        keepAspectRatio: false,
        isRoundedImage,
      });
    });

  const groupFormats = async (image) => {
    const zip = new JSZip();
    var folderName = zip.folder("images");
    return Promise.all(
      formats.map(async (resizeGroup) => {
        return Promise.all(
          resizeGroup.items.map(async (resizeItem) => {
            return Promise.all(
              resizeItem.items.map(async (formatItem) => {
                return new Promise(async (resolve) => {
                  const imageResized = await resizeFile(
                    image,
                    formatItem.width,
                    formatItem.height,
                    formatItem.type,
                    formatItem.radius
                  );
                  folderName
                    .folder(resizeGroup.name)
                    .folder(resizeItem.name)
                    .file(formatItem.name, imageResized);
                  resolve(imageResized);
                });
              })
            );
          })
        );
      })
    ).then(() => {
      return zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9,
        },
      });
    });
  };
  const handleResizeImage = async (image) => {
    await groupFormats(image).then((res) => {
      saveAs(res, "application_images.zip");
    });
  };
  return (
    <div className="App">
      <header className="App-header">
        <h4>Mobile Application Icon Resizer</h4>
        <input
          type="file"
          onChange={(image) => {
            handleResizeImage(image.target.files[0]);
          }}
          accept="image/*"
        />
        <p>Just upload icon then all icons will be download automatically.</p>
        <p>Android, iPhone, iPad, macOS, watchOS, tvOS</p>
        <a
          href="https://github.com/zaferatli/mobile-app-icon-resizer"
          target="_blank"
          rel="noopener noreferrer"
        >
          If you liked, you can starred github repo.
        </a>
      </header>
    </div>
  );
}

export default App;
