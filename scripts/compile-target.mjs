import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { CompilerBase } from "mind-ar/src/image-target/compiler-base.js";
import { buildTrackingImageList } from "mind-ar/src/image-target/image-list.js";
import { extractTrackingFeatures } from "mind-ar/src/image-target/tracker/extract-utils.js";
import "mind-ar/src/image-target/detector/kernels/cpu/index.js";

const root = process.cwd();
const sourcePath = path.join(root, "public/assets/business-card.png");
const outputPath = path.join(root, "public/targets/business-card.mind");

class DirectPngCompiler extends CompilerBase {
  createProcessCanvas() {
    throw new Error("DirectPngCompiler uses preprocessed PNG pixels.");
  }

  compileImageTargetsFromPngs(targetImages, progressCallback) {
    return new Promise(async (resolve) => {
      const percentPerImage = 50 / targetImages.length;
      let percent = 0;
      this.data = [];

      for (let i = 0; i < targetImages.length; i++) {
        const targetImage = targetImages[i];
        const { buildImageList } = await import("mind-ar/src/image-target/image-list.js");
        const { Detector } = await import("mind-ar/src/image-target/detector/detector.js");
        const { build: hierarchicalClusteringBuild } = await import("mind-ar/src/image-target/matching/hierarchical-clustering.js");
        const tf = await import("@tensorflow/tfjs");

        const imageList = buildImageList(targetImage);
        const percentPerAction = percentPerImage / imageList.length;
        const matchingData = [];

        for (const image of imageList) {
          const detector = new Detector(image.width, image.height);
          await tf.nextFrame();
          tf.tidy(() => {
            const input = tf.tensor(image.data, [image.data.length], "float32").reshape([image.height, image.width]);
            const { featurePoints } = detector.detect(input);
            const maximaPoints = featurePoints.filter((point) => point.maxima);
            const minimaPoints = featurePoints.filter((point) => !point.maxima);

            matchingData.push({
              maximaPoints,
              minimaPoints,
              maximaPointsCluster: hierarchicalClusteringBuild({ points: maximaPoints }),
              minimaPointsCluster: hierarchicalClusteringBuild({ points: minimaPoints }),
              width: image.width,
              height: image.height,
              scale: image.scale,
            });
            percent += percentPerAction;
            progressCallback(percent);
          });
        }

        this.data.push({
          targetImage,
          imageList,
          matchingData,
          trackingImageList: buildTrackingImageList(targetImage),
        });
      }

      const trackingDataList = await this.compileTrack({ progressCallback, targetImages, basePercent: 50 });
      for (let i = 0; i < targetImages.length; i++) {
        this.data[i].trackingData = trackingDataList[i];
      }

      resolve(this.data);
    });
  }

  compileTrack({ progressCallback, targetImages, basePercent }) {
    return new Promise((resolve) => {
      const percentPerImage = (100 - basePercent) / targetImages.length;
      let percent = 0;
      const list = [];

      for (const targetImage of targetImages) {
        const imageList = buildTrackingImageList(targetImage);
        const percentPerAction = percentPerImage / imageList.length;
        const trackingData = extractTrackingFeatures(imageList, () => {
          percent += percentPerAction;
          progressCallback(basePercent + percent);
        });
        list.push(trackingData);
      }

      resolve(list);
    });
  }
}

function readPngAsTargetImage(filePath) {
  const png = PNG.sync.read(fs.readFileSync(filePath));
  const grey = new Uint8Array(png.width * png.height);

  for (let i = 0; i < grey.length; i++) {
    const offset = i * 4;
    grey[i] = Math.floor((png.data[offset] + png.data[offset + 1] + png.data[offset + 2]) / 3);
  }

  return { data: grey, width: png.width, height: png.height };
}

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Target image not found: ${sourcePath}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const compiler = new DirectPngCompiler();
const targetImage = readPngAsTargetImage(sourcePath);
let lastProgress = -1;

await compiler.compileImageTargetsFromPngs([targetImage], (progress) => {
  const rounded = Math.floor(progress);
  if (rounded !== lastProgress && rounded % 10 === 0) {
    lastProgress = rounded;
    console.log(`Compiling target: ${rounded}%`);
  }
});

fs.writeFileSync(outputPath, Buffer.from(compiler.exportData()));
console.log(`Wrote ${path.relative(root, outputPath)}`);
